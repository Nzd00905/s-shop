
"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, User as FirebaseUser, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, EmailAuthProvider, reauthenticateWithCredential, updatePassword, sendEmailVerification, sendPasswordResetEmail, confirmPasswordReset as firebaseConfirmPasswordReset } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { ShippingAddress, CartItem } from '@/lib/types';
import { useToast } from './use-toast';

export interface User {
  uid: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  shippingAddress?: ShippingAddress;
  wishlist?: string[];
  cart?: CartItem[];
}

interface UserContextType {
  user: User | null;
  updateUser: (newUserData: Partial<Omit<User, 'uid' | 'cart'>>) => Promise<void>;
  signUpWithEmail: (name:string, email:string, password:string) => Promise<boolean>;
  signInWithEmail: (email:string, password:string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (code: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoaded: boolean;
}

const USERS_COLLECTION = 'users';

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        if (firebaseUser.emailVerified) {
            const userDocRef = doc(db, USERS_COLLECTION, firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
              setUser({ uid: firebaseUser.uid, ...userDocSnap.data() } as User);
            } else {
              const newUser: User = {
                  uid: firebaseUser.uid,
                  name: firebaseUser.displayName,
                  email: firebaseUser.email,
                  avatar: firebaseUser.photoURL,
              };
              await setDoc(userDocRef, newUser);
              setUser(newUser);
            }
        } else {
            setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  const updateUser = async (newUserData: Partial<Omit<User, 'uid' | 'cart'>>) => {
    if (!user) return;
    
    try {
        const userDocRef = doc(db, USERS_COLLECTION, user.uid);
        await updateDoc(userDocRef, newUserData);

        if (newUserData.name && auth.currentUser && newUserData.name !== auth.currentUser.displayName) {
             await updateProfile(auth.currentUser, { displayName: newUserData.name });
        }

        setUser(prevUser => prevUser ? { ...prevUser, ...newUserData } : null);
    } catch (error) {
        console.error("Error updating user:", error);
        toast({ title: "Error", description: "Could not update profile.", variant: 'destructive'});
    }
  };

  const signUpWithEmail = async (name: string, email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      const newUser: User = {
        uid: userCredential.user.uid,
        name,
        email,
        avatar: null,
      };
      await setDoc(doc(db, USERS_COLLECTION, newUser.uid), newUser);
      
      await sendEmailVerification(userCredential.user);

      await auth.signOut(); // Sign out the user, so they have to verify first.
      return true;
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        toast({ title: 'Sign-up failed', description: 'This email address is already in use. Please try a different email or sign in.', variant: 'destructive' });
      } else {
        console.error("Signup error:", error);
        toast({ title: 'Sign-up failed', description: 'An unexpected error occurred. Please try again.', variant: 'destructive' });
      }
      return false;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user.emailVerified) {
        await auth.signOut();
        toast({
            title: 'Verification Required',
            description: 'Please verify your email before signing in. A new verification link has been sent.',
            variant: 'destructive',
            duration: 5000,
        });
        await sendEmailVerification(userCredential.user);
        return false;
      }
      const userDocRef = doc(db, USERS_COLLECTION, userCredential.user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        setUser({ uid: userCredential.user.uid, ...userDocSnap.data() } as User);
      }
      return true;
    } catch (error: any) {
      toast({ title: 'Sign-in failed', description: 'Invalid email or password. Please try again.', variant: 'destructive' });
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser || !firebaseUser.email) {
        toast({ title: 'Error', description: 'No user is signed in.', variant: 'destructive' });
        return false;
    }

    const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);

    try {
        await reauthenticateWithCredential(firebaseUser, credential);
        await updatePassword(firebaseUser, newPassword);
        toast({ title: 'Success', description: 'Password updated successfully.', variant: 'success' });
        return true;
    } catch (error: any) {
        let errorMessage = "An unknown error occurred.";
        if (error.code === 'auth/wrong-password') {
            errorMessage = "The current password you entered is incorrect.";
        } else if (error.code === 'auth/weak-password') {
            errorMessage = "The new password is too weak.";
        }
        toast({ title: 'Password change failed', description: errorMessage, variant: 'destructive' });
        return false;
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: 'Reset Link Sent',
        description: 'If an account exists for this email, a password reset link has been sent.',
        variant: 'success',
      });
    } catch (error) {
      console.error("Password reset error:", error);
       toast({
        title: 'Error',
        description: 'Failed to send password reset email. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const confirmPasswordReset = async (code: string, newPassword: string) => {
    try {
      await firebaseConfirmPasswordReset(auth, code, newPassword);
      toast({
        title: 'Password Reset Successful',
        description: 'You can now log in with your new password.',
        variant: 'success',
      });
      router.push('/login');
    } catch (error: any) {
        let message = 'Failed to reset password. The link may be invalid or expired.';
        if (error.code === 'auth/invalid-action-code') {
            message = 'The password reset link is invalid or has expired. Please request a new one.';
        } else if (error.code === 'auth/weak-password') {
            message = 'The new password is too weak.';
        }
       toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  }

  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const value = {
    user,
    updateUser,
    signUpWithEmail,
    signInWithEmail,
    changePassword,
    sendPasswordReset,
    confirmPasswordReset,
    logout,
    isLoaded,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
