
"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, writeBatch, query, where, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/lib/types';
import { useToast } from './use-toast';
import { products as initialProducts } from '@/lib/data'; // for initial seeding

const PRODUCTS_COLLECTION = 'products';

interface ProductsContextType {
    products: Product[];
    isLoaded: boolean;
    addProduct: (productData: Omit<Product, 'id' | 'rating' >) => Promise<void>;
    updateProduct: (productId: string, productData: Partial<Omit<Product, 'id'>>) => Promise<void>;
    deleteProduct: (productId: string) => Promise<void>;
    updateProductCategory: (oldCategoryName: string, newCategoryName: string) => Promise<void>;
    getProductById: (productId: string) => Promise<Product | null>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const { toast } = useToast();

    const fetchProducts = useCallback(async () => {
        try {
            const productsCollection = collection(db, PRODUCTS_COLLECTION);
            const productSnapshot = await getDocs(productsCollection);
            if (productSnapshot.empty) {
                console.log("Products collection is empty, seeding initial data...");
                const batch = writeBatch(db);
                initialProducts.forEach(product => {
                    const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
                    batch.set(docRef, {
                        name: product.name,
                        price: product.price,
                        description: product.description,
                        images: product.images,
                        stock: product.stock,
                        rating: product.rating,
                        category: product.category,
                    });
                });
                await batch.commit();
                setProducts(initialProducts);
            } else {
                const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
                setProducts(productList);
            }
        } catch (error) {
            console.error("Failed to fetch products:", error);
            toast({ title: 'Error', description: 'Could not fetch products from the database.', variant: 'destructive' });
        } finally {
            setIsLoaded(true);
        }
    }, [toast]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const addProduct = async (productData: Omit<Product, 'id' | 'rating'>) => {
        try {
            const newProductData = {
                ...productData,
                rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
            };
            const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), newProductData);
            const newProduct = { id: docRef.id, ...newProductData };
            setProducts(prev => [newProduct as Product, ...prev]);
            toast({
                title: 'Product Added',
                description: `${newProduct.name} has been successfully added.`,
                variant: 'success'
            });
        } catch (error) {
            console.error("Error adding product: ", error);
            toast({ title: 'Error', description: 'Could not add product.', variant: 'destructive' });
        }
    };

    const updateProduct = async (productId: string, productData: Partial<Omit<Product, 'id'>>) => {
        try {
            const productRef = doc(db, PRODUCTS_COLLECTION, productId);
            await updateDoc(productRef, productData);
            setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...productData } as Product : p));
            toast({
                title: 'Product Updated',
                description: 'The product has been successfully updated.',
                variant: 'success'
            });
        } catch (error) {
            console.error("Error updating product: ", error);
            toast({ title: 'Error', description: 'Could not update product.', variant: 'destructive' });
        }
    };
    
    const deleteProduct = async (productId: string) => {
        try {
            await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
            setProducts(prev => prev.filter(p => p.id !== productId));
            toast({
                title: 'Product Deleted',
                description: 'The product has been successfully deleted.',
                variant: 'success'
            });
        } catch (error) {
            console.error("Error deleting product: ", error);
            toast({ title: 'Error', description: 'Could not delete product.', variant: 'destructive' });
        }
    };

    const updateProductCategory = async (oldCategoryName: string, newCategoryName: string) => {
        const q = query(collection(db, PRODUCTS_COLLECTION), where("category", "==", oldCategoryName));
        const querySnapshot = await getDocs(q);
        const batch = writeBatch(db);
        querySnapshot.forEach(document => {
            const docRef = doc(db, PRODUCTS_COLLECTION, document.id);
            batch.update(docRef, { category: newCategoryName });
        });
        await batch.commit();
        fetchProducts(); 
    };

    const getProductById = async (productId: string): Promise<Product | null> => {
        try {
            const productRef = doc(db, PRODUCTS_COLLECTION, productId);
            const productSnap = await getDoc(productRef);
            if (productSnap.exists()) {
                return { id: productSnap.id, ...productSnap.data() } as Product;
            }
            return null;
        } catch (error) {
            console.error("Error fetching product by ID:", error);
            return null;
        }
    }

    const value = { products, isLoaded, addProduct, updateProduct, deleteProduct, updateProductCategory, getProductById };

    return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export function useProducts() {
    const context = useContext(ProductsContext);
    if (context === undefined) {
        throw new Error('useProducts must be used within a ProductsProvider');
    }
    return context;
}
