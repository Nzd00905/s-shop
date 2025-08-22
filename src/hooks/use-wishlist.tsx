
"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from '@/lib/firebase';
import type { Product } from '@/lib/types';
import { useUser } from './use-user';
import { useProducts } from './use-products';

const WISHLIST_LOCAL_KEY = 'wishlist_local';
const USERS_COLLECTION = 'users';


interface WishlistContextType {
    wishlist: Product[];
    toggleWishlist: (product: Product) => void;
    isInWishlist: (productId: string) => boolean;
    removeFromWishlist: (productId: string) => void;
    isLoaded: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);


export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user, isLoaded: isUserLoaded } = useUser();
  const { products, isLoaded: areProductsLoaded } = useProducts();


  const getLocalWishlist = useCallback(() => {
    try {
        const storedWishlist = localStorage.getItem(WISHLIST_LOCAL_KEY);
        return storedWishlist ? JSON.parse(storedWishlist) : [];
    } catch (error) {
        console.error("Failed to parse local wishlist:", error);
        return [];
    }
  }, []);

  const setLocalWishlist = useCallback((ids: string[]) => {
      localStorage.setItem(WISHLIST_LOCAL_KEY, JSON.stringify(ids));
  }, []);


  useEffect(() => {
    if (isUserLoaded) {
        if(user && user.wishlist) {
            setWishlistIds(user.wishlist);
        } else {
            setWishlistIds(getLocalWishlist());
        }
        setIsLoaded(true);
    }
  }, [isUserLoaded, user, getLocalWishlist]);


  useEffect(() => {
      if (areProductsLoaded && isLoaded) {
          const wishlistProducts = products.filter(p => wishlistIds.includes(p.id));
          setWishlist(wishlistProducts);
      }
  }, [wishlistIds, products, areProductsLoaded, isLoaded]);

  const toggleWishlist = useCallback(async (product: Product) => {
    const isInWishlist = wishlistIds.includes(product.id);
    const newWishlistIds = isInWishlist
        ? wishlistIds.filter(id => id !== product.id)
        : [...wishlistIds, product.id];
    
    setWishlistIds(newWishlistIds);

    if (user) {
        const userRef = doc(db, USERS_COLLECTION, user.uid);
        await updateDoc(userRef, {
            wishlist: isInWishlist ? arrayRemove(product.id) : arrayUnion(product.id)
        });
    } else {
        setLocalWishlist(newWishlistIds);
    }
  }, [wishlistIds, user, setLocalWishlist]);

  const isInWishlist = useCallback((productId: string) => {
    return wishlistIds.includes(productId);
  }, [wishlistIds]);

  const removeFromWishlist = useCallback(async (productId: string) => {
    const newWishlistIds = wishlistIds.filter(id => id !== productId);
    setWishlistIds(newWishlistIds);

    if (user) {
        const userRef = doc(db, USERS_COLLECTION, user.uid);
        await updateDoc(userRef, {
            wishlist: arrayRemove(productId)
        });
    } else {
        setLocalWishlist(newWishlistIds);
    }
  }, [wishlistIds, user, setLocalWishlist]);

  const value = { wishlist, toggleWishlist, isInWishlist, removeFromWishlist, isLoaded };
  
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}


export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
