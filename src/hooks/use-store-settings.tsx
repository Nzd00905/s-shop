
"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Banner } from '@/lib/types';
import { useToast } from './use-toast';

const SETTINGS_DOC_ID = 'store_config';
const SETTINGS_COLLECTION = 'settings';
const BANNERS_COLLECTION = 'banners';

interface StoreSettings {
    shopName: string;
    logo: string | null;
    banners: Banner[];
    currencySymbol: string;
    shippingFee: number;
}

interface StoreSettingsContextType {
    settings: StoreSettings;
    isLoaded: boolean;
    setShopName: (name: string) => void;
    addBanner: (bannerData: Omit<Banner, 'id'>) => void;
    deleteBanner: (bannerId: string) => void;
    setCurrencySymbol: (symbol: string) => void;
    setShippingFee: (fee: number) => void;
}

const StoreSettingsContext = createContext<StoreSettingsContextType | undefined>(undefined);

const initialBanners: Omit<Banner, 'id'>[] = [
    { title: 'Summer Sale', image: 'https://placehold.co/1200x400.png', dataAiHint: 'summer sale' },
    { title: 'New Arrivals', image: 'https://placehold.co/1200x400.png', dataAiHint: 'new products' },
    { title: 'Free Shipping', image: 'https://placehold.co/1200x400.png', dataAiHint: 'delivery truck' },
];

const defaultSettings: Omit<StoreSettings, 'banners'> = {
    shopName: 'ShopSwift',
    logo: null,
    currencySymbol: '$',
    shippingFee: 0,
}

export function StoreSettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<StoreSettings>({ ...defaultSettings, banners: [] });
    const [isLoaded, setIsLoaded] = useState(false);
    const { toast } = useToast();

    const fetchSettings = useCallback(async () => {
        setIsLoaded(false);
        try {
            // Fetch main settings
            const settingsDoc = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
            const settingsSnap = await getDoc(settingsDoc);
            let mainSettings = defaultSettings;
            if (settingsSnap.exists()) {
                mainSettings = { ...defaultSettings, ...settingsSnap.data() };
            } else {
                await setDoc(settingsDoc, defaultSettings);
            }

            // Fetch banners from their own collection
            const bannersCollection = collection(db, BANNERS_COLLECTION);
            const bannersSnap = await getDocs(bannersCollection);
            let bannerList: Banner[] = [];
            if (bannersSnap.empty) {
                // Seed initial banners if collection is empty
                for (const bannerData of initialBanners) {
                    const bannerRef = await addDoc(bannersCollection, bannerData);
                    bannerList.push({ id: bannerRef.id, ...bannerData });
                }
            } else {
                bannerList = bannersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner));
            }
            
            setSettings({ ...mainSettings, banners: bannerList });

        } catch (error) {
            console.error("Failed to fetch settings from Firestore", error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const updateMainSettingsInFirestore = useCallback(async (newSettings: Partial<Omit<StoreSettings, 'banners' | 'logo'>>) => {
        try {
            const settingsDoc = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
            await setDoc(settingsDoc, newSettings, { merge: true });
        } catch (error) {
            console.error("Error updating settings in Firestore", error);
            toast({ title: 'Error', description: "Could not save settings.", variant: 'destructive'});
        }
    }, [toast]);

    const setShopName = useCallback((name: string) => {
        setSettings(prev => ({ ...prev, shopName: name }));
        updateMainSettingsInFirestore({ shopName: name });
    }, [updateMainSettingsInFirestore]);

     const setCurrencySymbol = (symbol: string) => {
        setSettings(prev => ({...prev, currencySymbol: symbol}));
        updateMainSettingsInFirestore({ currencySymbol: symbol });
    };

    const setShippingFee = (fee: number) => {
        setSettings(prev => ({ ...prev, shippingFee: fee }));
        updateMainSettingsInFirestore({ shippingFee: fee });
    };

    const addBanner = useCallback(async (bannerData: Omit<Banner, 'id'>) => {
        try {
            const docRef = await addDoc(collection(db, BANNERS_COLLECTION), bannerData);
            const newBanner = { ...bannerData, id: docRef.id };
            setSettings(prev => ({ ...prev, banners: [...prev.banners, newBanner] }));
            toast({ title: "Success", description: "New banner added." });
        } catch (error) {
             console.error("Error adding banner:", error);
             toast({ title: 'Error', description: "Could not add banner. The image might be too large.", variant: 'destructive' });
        }
    }, [toast]);

    const deleteBanner = useCallback(async (bannerId: string) => {
        try {
            await deleteDoc(doc(db, BANNERS_COLLECTION, bannerId));
            setSettings(prev => ({ ...prev, banners: prev.banners.filter(b => b.id !== bannerId) }));
            toast({ title: "Success", description: "Banner removed." });
        } catch(error) {
            console.error("Error deleting banner:", error);
            toast({ title: 'Error', description: "Could not remove banner.", variant: 'destructive' });
        }
    }, [toast]);


    const value = { settings, isLoaded, setShopName, addBanner, deleteBanner, setCurrencySymbol, setShippingFee };

    return <StoreSettingsContext.Provider value={value}>{children}</StoreSettingsContext.Provider>;
}

export function useStoreSettings() {
    const context = useContext(StoreSettingsContext);
    if (context === undefined) {
        throw new Error('useStoreSettings must be used within a StoreSettingsProvider');
    }
    return context;
}
