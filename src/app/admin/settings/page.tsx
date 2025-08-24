
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { Upload, X } from 'lucide-react';
import type { Banner } from '@/lib/types';
import { useStoreSettings } from '@/hooks/use-store-settings';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z.string().min(6, "New password must be at least 6 characters."),
    confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match",
    path: ["confirmPassword"],
});


export default function StoreSettingsPage() {
    const { settings, setShopName, addBanner, deleteBanner, setCurrencySymbol, setShippingFee, isLoaded } = useStoreSettings();
    const { toast } = useToast();

    const [nameInput, setNameInput] = useState('');
    const [currencyInput, setCurrencyInput] = useState('');
    const [shippingInput, setShippingInput] = useState(0);

    const [newBannerTitle, setNewBannerTitle] = useState('');
    const [newBannerImage, setNewBannerImage] = useState<string | null>(null);

    const passwordForm = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

     useEffect(() => {
        if (isLoaded) {
            setNameInput(settings.shopName);
            setCurrencyInput(settings.currencySymbol);
            setShippingInput(settings.shippingFee);
        }
    }, [isLoaded, settings]);

    const handleNameSave = () => {
        setShopName(nameInput);
        toast({ title: "Success", description: "Shop name updated successfully." });
    };

     const handleCurrencySave = () => {
        setCurrencySymbol(currencyInput);
        toast({ title: "Success", description: "Currency symbol updated successfully." });
    };

    const handleShippingSave = () => {
        setShippingFee(shippingInput);
        toast({ title: "Success", description: "Shipping fee updated successfully." });
    };


    const handleBannerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewBannerImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleAddBanner = () => {
        if (!newBannerTitle || !newBannerImage) {
            toast({ title: 'Error', description: 'Please provide a title and an image.', variant: 'destructive' });
            return;
        }
        const newBanner: Omit<Banner, 'id'> = { title: newBannerTitle, image: newBannerImage, dataAiHint: 'custom banner' };
        addBanner(newBanner);
        setNewBannerTitle('');
        setNewBannerImage(null);
        toast({ title: "Success", description: "New banner added." });
    };

    async function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
        const username = localStorage.getItem('adminUsername');
        if (!username) {
            toast({ title: "Error", description: "Could not identify admin user.", variant: "destructive" });
            return;
        }

        try {
            const adminsRef = collection(db, 'admins');
            const q = query(adminsRef, where("username", "==", username));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                toast({ title: "Error", description: "Admin user not found.", variant: "destructive" });
                return;
            }

            const adminDoc = querySnapshot.docs[0];
            if (adminDoc.data().password !== values.currentPassword) {
                passwordForm.setError("currentPassword", {
                    type: "manual",
                    message: "Current password does not match.",
                });
                return;
            }
            
            const batch = writeBatch(db);
            batch.update(adminDoc.ref, { password: values.newPassword });
            await batch.commit();

            toast({ title: "Success", description: "Password updated successfully.", variant: "success"});
            passwordForm.reset();
        } catch (error) {
            console.error("Error updating password:", error);
            toast({ title: "Error", description: "Failed to update password.", variant: "destructive"});
        }
    }


    return (
        <div className="grid gap-6">
             <Card>
                <CardHeader>
                    <CardTitle>Shop Name</CardTitle>
                    <CardDescription>Customize the name for your shop.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-4">
                        <div className="flex-grow">
                             <Label htmlFor="shop-name">Name</Label>
                            <Input id="shop-name" value={nameInput} onChange={(e) => setNameInput(e.target.value)} />
                        </div>
                        <Button onClick={handleNameSave}>Save</Button>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Admin Account</CardTitle>
                    <CardDescription>Manage your admin credentials.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
                            <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                                <FormItem><FormLabel>Current Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                                <FormItem><FormLabel>New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                                <FormItem><FormLabel>Confirm New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <div className="flex justify-end">
                                <Button type="submit">Update Password</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Currency</CardTitle>
                    <CardDescription>Set the currency symbol for your store.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-4">
                        <div className="flex-grow">
                             <Label htmlFor="currency-symbol">Symbol</Label>
                            <Input id="currency-symbol" value={currencyInput} onChange={(e) => setCurrencyInput(e.target.value)} className="w-24" />
                        </div>
                        <Button onClick={handleCurrencySave}>Save</Button>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Shipping</CardTitle>
                    <CardDescription>Set the flat shipping rate for orders.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-4">
                        <div className="flex-grow">
                             <Label htmlFor="shipping-fee">Fee</Label>
                            <Input id="shipping-fee" type="number" value={shippingInput} onChange={(e) => setShippingInput(parseFloat(e.target.value) || 0)} className="w-32" />
                        </div>
                        <Button onClick={handleShippingSave}>Save</Button>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Web Banner</CardTitle>
                    <CardDescription>Manage the promotional banners on your homepage.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div>
                        <h3 className="text-lg font-medium mb-4">Current Banners</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {settings.banners.map(banner => (
                                <div key={banner.id} className="relative group">
                                    <Image src={banner.image} alt={banner.title} width={600} height={200} className="rounded-lg object-cover aspect-[3/1]" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
                                         <p className="text-white font-bold text-xl">{banner.title}</p>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100"
                                        onClick={() => deleteBanner(banner.id)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                         </div>
                    </div>
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-medium mb-4">Add New Banner</h3>
                        <div className="grid gap-4 max-w-md">
                            <div className="grid gap-2">
                                <Label htmlFor="banner-title">Banner Title</Label>
                                <Input id="banner-title" value={newBannerTitle} onChange={e => setNewBannerTitle(e.target.value)} placeholder="e.g., '20% Off Sale'" />
                            </div>
                             <div className="grid gap-2">
                                <Label>Banner Image</Label>
                                <div className="aspect-[3/1] border-2 border-dashed border-muted-foreground/50 rounded-lg flex items-center justify-center relative">
                                    {newBannerImage ? (
                                        <>
                                            <Image src={newBannerImage} alt="New Banner Preview" fill className="object-cover rounded-md" />
                                             <Button
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 h-7 w-7 rounded-full"
                                                onClick={() => setNewBannerImage(null)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <Label htmlFor="banner-image-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                            <Upload className="h-8 w-8" />
                                            <span>Click or drag to upload</span>
                                        </Label>
                                    )}
                                </div>
                                <Input id="banner-image-upload" type="file" className="sr-only" onChange={handleBannerImageUpload} accept="image/*" />
                            </div>
                            <Button onClick={handleAddBanner} disabled={!newBannerImage || !newBannerTitle}>Add Banner</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
