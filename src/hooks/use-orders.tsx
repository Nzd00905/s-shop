
"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, query, where, orderBy, writeBatch, increment, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order, CartItem, ShippingAddress, OrderStatus, Product } from '@/lib/types';
import { useUser } from './use-user'; 
import { useToast } from './use-toast';

const ORDERS_COLLECTION = 'orders';
const PRODUCTS_COLLECTION = 'products';

interface OrdersContextType {
    orders: Order[];
    addOrder: (items: CartItem[], shippingAddress: ShippingAddress, total: number, shippingFee: number) => Promise<string | null>;
    updateOrderStatus: (orderId: string, status: OrderStatus) => void;
    updateCustomerInOrders: (customerId: string, newAddress: ShippingAddress) => Promise<void>;
    isLoaded: boolean;
    userOrders: Order[];
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user, isLoaded: isUserLoaded } = useUser();
  const { toast } = useToast();

  const fetchAllOrders = useCallback(async () => {
    try {
        const ordersCollection = collection(db, ORDERS_COLLECTION);
        const q = query(ordersCollection, orderBy('date', 'desc'));
        const orderSnapshot = await getDocs(q);
        const orderList = orderSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        setOrders(orderList);
    } catch (error) {
        console.error("Failed to fetch all orders from Firestore", error);
    } finally {
        setIsLoaded(true);
    }
  }, []);
  
  const fetchUserOrders = useCallback(async (uid: string) => {
    if (!user?.email) {
        setUserOrders([]);
        return;
    }
    try {
        const ordersCollection = collection(db, ORDERS_COLLECTION);
        const q = query(ordersCollection, where('userEmail', '==', user.email));
        const orderSnapshot = await getDocs(q);
        const orderList = orderSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        orderList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setUserOrders(orderList);
    } catch (error) {
        console.error("Failed to fetch user orders from Firestore", error);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchAllOrders();
    if (isUserLoaded && user) {
        fetchUserOrders(user.uid);
    }
  }, [isUserLoaded, user, fetchAllOrders, fetchUserOrders]);


  const addOrder = async (items: CartItem[], shippingAddress: ShippingAddress, total: number, shippingFee: number) => {
    try {
      const orderId = doc(collection(db, 'dummy')).id; // Generate a new ID for the order

      await runTransaction(db, async (transaction) => {
        // 1. Validate stock for all items
        for (const item of items) {
          const productRef = doc(db, PRODUCTS_COLLECTION, item.id);
          const productDoc = await transaction.get(productRef);
          if (!productDoc.exists()) {
            throw new Error(`Product ${item.name} not found.`);
          }
          const currentStock = productDoc.data().stock;
          if (currentStock < item.quantity) {
            throw new Error(`Not enough stock for ${item.name}.`);
          }
        }
        
        // 2. Create the order
        const orderItems = items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            images: item.images,
            category: item.category,
            description: item.description,
            rating: item.rating,
            stock: item.stock,
        }));

        const newOrder: Omit<Order, 'id'> = {
            items: orderItems,
            total,
            shippingFee,
            status: 'Pending',
            date: new Date().toISOString(),
            shippingAddress: { ...shippingAddress, id: user?.email || shippingAddress.fullName },
            userEmail: user?.email || '',
        };
        
        const orderRef = doc(db, ORDERS_COLLECTION, orderId);
        transaction.set(orderRef, newOrder);
        
        // 3. Update stock for each product
        for (const item of items) {
          const productRef = doc(db, PRODUCTS_COLLECTION, item.id);
          transaction.update(productRef, { stock: increment(-item.quantity) });
        }
      });
      
      // Manually update local state after successful transaction
      const createdOrder: Order = { 
        id: orderId, 
        items: items, 
        total, 
        shippingFee, 
        status: 'Pending', 
        date: new Date().toISOString(), 
        shippingAddress: { ...shippingAddress, id: user?.email || shippingAddress.fullName },
        userEmail: user?.email || ''
      };
      
      setOrders(prev => [createdOrder, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      if (user) {
        setUserOrders(prev => [createdOrder, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
      
      // Local product state will be stale, but will sync on next full load.
      // For immediate consistency, you might trigger a refetch of products here.

      return orderId;
    } catch (error: any) {
      toast({ title: "Order Failed", description: error.message || "Could not place the order.", variant: 'destructive'});
      return null;
    }
  };
  
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
        const orderRef = doc(db, ORDERS_COLLECTION, orderId);
        await updateDoc(orderRef, { status });
        const updater = (prevOrders: Order[]) => prevOrders.map(order => 
            order.id === orderId ? { ...order, status } : order
        );
        setOrders(updater);
        if(user) setUserOrders(updater);
    } catch (error) {
        console.error("Error updating order status:", error);
    }
  };

  const updateCustomerInOrders = async (customerId: string, newAddress: ShippingAddress) => {
    try {
        const q = query(collection(db, ORDERS_COLLECTION), where("shippingAddress.id", "==", customerId));
        const querySnapshot = await getDocs(q);
        const batch = writeBatch(db);
        querySnapshot.forEach(document => {
            batch.update(doc(db, ORDERS_COLLECTION, document.id), { shippingAddress: newAddress });
        });
        await batch.commit();
        await fetchAllOrders();
    } catch (error) {
        console.error("Error updating customer in orders:", error);
    }
  };

  const value = {
      orders,
      userOrders,
      addOrder,
      updateOrderStatus,
      updateCustomerInOrders,
      isLoaded,
  };

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
}


export function useOrders() {
    const context = useContext(OrdersContext);
    if (context === undefined) {
        throw new Error('useOrders must be used within a OrdersProvider');
    }
    return context;
}
