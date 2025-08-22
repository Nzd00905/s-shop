
"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from './use-toast';
import { useProducts } from './use-products';
import { products as initialProducts } from '@/lib/data';

interface Category {
    id: string;
    name: string;
}

interface CategoriesContextType {
    categories: Category[];
    isLoaded: boolean;
    addCategory: (name: string) => Promise<void>;
    updateCategory: (id: string, newName: string) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

const CATEGORIES_COLLECTION = 'categories';

export function CategoriesProvider({ children }: { children: ReactNode }) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const { toast } = useToast();
    const { updateProductCategory } = useProducts();

    const fetchCategories = useCallback(async () => {
        try {
            const categoriesCollection = collection(db, CATEGORIES_COLLECTION);
            const categorySnapshot = await getDocs(categoriesCollection);
            if (categorySnapshot.empty) {
                 console.log("Categories collection is empty, seeding initial data...");
                const batch = writeBatch(db);
                const categoryNames = [...new Set(initialProducts.map(p => p.category))];
                const seededCategories: Category[] = [];
                categoryNames.forEach(name => {
                    const docRef = doc(collection(db, CATEGORIES_COLLECTION));
                    batch.set(docRef, { name });
                    seededCategories.push({ id: docRef.id, name });
                });
                await batch.commit();
                setCategories(seededCategories);
            } else {
                const categoryList = categorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
                setCategories(categoryList);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
            toast({ title: 'Error', description: 'Could not fetch categories.', variant: 'destructive' });
        } finally {
            setIsLoaded(true);
        }
    }, [toast]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const addCategory = async (name: string) => {
        try {
            const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), { name });
            setCategories(prev => [...prev, { id: docRef.id, name }]);
            toast({ title: 'Category Added', description: `Category "${name}" has been added.`, variant: 'success' });
        } catch (error) {
            console.error("Error adding category:", error);
            toast({ title: 'Error', description: 'Could not add category.', variant: 'destructive' });
        }
    };

    const updateCategory = async (id: string, newName: string) => {
        try {
            const oldCategoryName = categories.find(c => c.id === id)?.name;
            const categoryRef = doc(db, CATEGORIES_COLLECTION, id);
            await updateDoc(categoryRef, { name: newName });
            
            if (oldCategoryName) {
                await updateProductCategory(oldCategoryName, newName);
            }

            setCategories(prev => prev.map(c => c.id === id ? { ...c, name: newName } : c));
            toast({ title: 'Category Updated', description: 'Category has been updated.', variant: 'success' });
        } catch (error) {
            console.error("Error updating category:", error);
            toast({ title: 'Error', description: 'Could not update category.', variant: 'destructive' });
        }
    };
    
    const deleteCategory = async (id: string) => {
        try {
            const categoryName = categories.find(c => c.id === id)?.name;
            await deleteDoc(doc(db, CATEGORIES_COLLECTION, id));

            if(categoryName) {
                await updateProductCategory(categoryName, 'Uncategorized');
            }

            setCategories(prev => prev.filter(c => c.id !== id));
            toast({ title: 'Category Deleted', description: 'Category has been deleted.', variant: 'success' });
        } catch (error) {
            console.error("Error deleting category:", error);
            toast({ title: 'Error', description: 'Could not delete category.', variant: 'destructive' });
        }
    };


    const value = { categories, isLoaded, addCategory, updateCategory, deleteCategory };

    return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
}

export function useCategories() {
    const context = useContext(CategoriesContext);
    if (context === undefined) {
        throw new Error('useCategories must be used within a CategoriesProvider');
    }
    return context;
}
