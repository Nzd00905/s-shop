
"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { collection, getDocs, updateDoc, doc, writeBatch, query, where, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from './use-user';
import { useToast } from './use-toast';
import { useOrders } from './use-orders';

interface AllUsersContextType {
    users: User[];
    isLoaded: boolean;
    updateUser: (uid: string, newUserData: Partial<User>) => Promise<void>;
    deleteUser: (uid: string) => Promise<void>;
}

const AllUsersContext = createContext<AllUsersContextType | undefined>(undefined);

const USERS_COLLECTION = 'users';

export function AllUsersProvider({ children }: { children: ReactNode }) {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const { toast } = useToast();
    const { updateCustomerInOrders } = useOrders();

    const fetchAllUsers = useCallback(async () => {
        try {
            const usersCollection = collection(db, USERS_COLLECTION);
            const userSnapshot = await getDocs(usersCollection);
            const userList = userSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
            setUsers(userList);
        } catch (error) {
            console.error("Failed to fetch all users:", error);
            toast({ title: 'Error', description: 'Could not fetch users.', variant: 'destructive' });
        } finally {
            setIsLoaded(true);
        }
    }, [toast]);

    useEffect(() => {
        fetchAllUsers();
    }, [fetchAllUsers]);

    const updateUser = async (uid: string, newUserData: Partial<User>) => {
        const originalUser = users.find(u => u.uid === uid);
        if (!originalUser || !originalUser.email) {
            toast({ title: "Error", description: "Could not find original user data to update.", variant: 'destructive'});
            return;
        }

        try {
            const userDocRef = doc(db, USERS_COLLECTION, uid);
            await updateDoc(userDocRef, newUserData);
            
            if (newUserData.shippingAddress) {
                await updateCustomerInOrders(originalUser.email, newUserData.shippingAddress);
            }

            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.uid === uid ? { ...user, ...newUserData } : user
                )
            );
        } catch (error) {
            console.error("Error updating user:", error);
            toast({ title: "Error", description: "Could not update user profile.", variant: 'destructive'});
        }
    };
    
    const deleteUser = async (uid: string) => {
        try {
            const userDocRef = doc(db, USERS_COLLECTION, uid);
            await deleteDoc(userDocRef);
            setUsers(prevUsers => prevUsers.filter(user => user.uid !== uid));
            toast({ title: 'Success', description: 'Customer has been deleted.', variant: 'success' });
        } catch (error) {
            console.error("Error deleting user:", error);
            toast({ title: 'Error', description: 'Could not delete customer.', variant: 'destructive' });
        }
        // Note: This does not delete the user from Firebase Authentication.
        // That would require a backend function for security reasons.
    };

    const value = { users, isLoaded, updateUser, deleteUser };

    return <AllUsersContext.Provider value={value}>{children}</AllUsersContext.Provider>;
}

export function useAllUsers() {
    const context = useContext(AllUsersContext);
    if (context === undefined) {
        throw new Error('useAllUsers must be used within a AllUsersProvider');
    }
    return context;
}
