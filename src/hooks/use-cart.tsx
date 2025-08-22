
"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode, useRef } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { CartItem, Product } from '@/lib/types';
import { useToast } from './use-toast';
import { useUser } from './use-user';

const CART_LOCAL_KEY = 'cart_local';
const USERS_COLLECTION = 'users';

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: Product, quantity?: number, callback?: () => void) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, newQuantity: number) => void;
    clearCart: () => void;
    cartCount: number;
    isLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user, isLoaded: isUserLoaded } = useUser();
  const { toast } = useToast();
  const lastCartCount = useRef(0);

  const getLocalCart = useCallback(() => {
    try {
        const storedCart = localStorage.getItem(CART_LOCAL_KEY);
        return storedCart ? JSON.parse(storedCart) : [];
    } catch(error) {
        return [];
    }
  }, []);

  const setLocalCart = useCallback((cart: CartItem[]) => {
      localStorage.setItem(CART_LOCAL_KEY, JSON.stringify(cart));
  }, []);
  
  const updateCartInFirestore = useCallback(async (newCart: CartItem[]) => {
      if (!user) return;
      try {
          const userDocRef = doc(db, USERS_COLLECTION, user.uid);
          await updateDoc(userDocRef, { cart: newCart });
      } catch (error) {
          console.error("Could not update cart in Firestore", error);
      }
  }, [user]);

  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        const userDocRef = doc(db, USERS_COLLECTION, user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists() && userDocSnap.data().cart) {
          setCartItems(userDocSnap.data().cart);
        } else {
          setCartItems([]);
        }
      } else {
        setCartItems(getLocalCart());
      }
      setIsLoaded(true);
    };

    if (isUserLoaded) {
      loadCart();
    }
  }, [isUserLoaded, user, getLocalCart]);


  const addToCart = (product: Product, quantity: number = 1, callback?: () => void) => {
    setCartItems(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      let newCart: CartItem[];
      
      if (existingItem) {
        newCart = prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        newCart = [...prevCart, { ...product, quantity }];
      }

      if(user) {
          updateCartInFirestore(newCart);
      } else {
          setLocalCart(newCart);
      }
      
      if (callback) {
        callback();
      }
      
      return newCart;
    });
  };

  const removeFromCart = useCallback((productId: string) => {
    setCartItems(prevCart => {
        const newCart = prevCart.filter(item => item.id !== productId);
        if(user) {
            updateCartInFirestore(newCart);
        } else {
            setLocalCart(newCart);
        }
        return newCart;
    });
  }, [user, setLocalCart, updateCartInFirestore]);

  const updateQuantity = useCallback((productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    };
    setCartItems(prevCart => {
        const newCart = prevCart.map(item => 
            item.id === productId ? { ...item, quantity: newQuantity } : item
        );
         if(user) {
            updateCartInFirestore(newCart);
        } else {
            setLocalCart(newCart);
        }
        return newCart;
    });
  }, [removeFromCart, user, setLocalCart, updateCartInFirestore]);

  const clearCart = useCallback(() => {
    setCartItems([]);
     if(user) {
        updateCartInFirestore([]);
    } else {
        setLocalCart([]);
    }
  }, [user, setLocalCart, updateCartInFirestore]);

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const value = {
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      isLoaded
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}


export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
