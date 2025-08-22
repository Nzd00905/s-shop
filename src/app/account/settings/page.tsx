
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTheme } from 'next-themes';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Moon, Sun, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import { FullPageLoader } from '@/components/ui/loader';

const addressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zip: z.string().regex(/^\d{4}$/, "Must be a 4-digit ZIP code"),
  phone: z.string().regex(/^01[3-9]\d{8}$/, "Must be a valid 11-digit Bangladeshi number"),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z.string().min(6, "New password must be at least 6 characters."),
    confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match",
    path: ["confirmPassword"],
});


export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { user, updateUser, changePassword, isLoaded, logout } = useUser();
  const router = useRouter();

  const addressForm = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      phone: "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  useEffect(() => {
    if (isLoaded && !user) {
        router.push('/login');
    }
    if (isLoaded && user?.shippingAddress) {
      addressForm.reset(user.shippingAddress);
    }
  }, [isLoaded, user, router, addressForm]);


  function onAddressSubmit(values: z.infer<typeof addressSchema>) {
    updateUser({ shippingAddress: values });
    toast({
      title: 'Address Saved',
      description: 'Your default shipping address has been updated.',
      variant: 'success',
    });
  }

  async function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
    const success = await changePassword(values.currentPassword, values.newPassword);
    if (success) {
        passwordForm.reset();
    }
  }

  const handleDeleteAccount = async () => {
    // In a real app, you'd also delete the user from your backend.
    await logout();
    // Potentially clear other related local storage data
    toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
        variant: "destructive"
    })
  };

  if (!isLoaded || !user) {
    return <FullPageLoader />;
  }

  return (
    <MainLayout>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-headline font-bold mb-6 text-center">Settings</h1>
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize the look and feel of the app.</CardDescription>
                </CardHeader>
                <CardContent className='flex items-center justify-between'>
                    <p className='font-medium'>Theme</p>
                    <div className="flex items-center gap-2">
                        <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => setTheme('light')} size="sm">
                            <Sun className="h-4 w-4 mr-2" /> Light
                        </Button>
                        <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => setTheme('dark')} size="sm">
                            <Moon className="h-4 w-4 mr-2" /> Dark
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your password here. Choose a strong one!</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
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
                    <CardTitle>Default Shipping Address</CardTitle>
                    <CardDescription>This address will be pre-filled at checkout.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...addressForm}>
                    <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-4">
                        <FormField control={addressForm.control} name="fullName" render={({ field }) => (
                            <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={addressForm.control} name="address" render={({ field }) => (
                            <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <FormField control={addressForm.control} name="city" render={({ field }) => (
                                <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={addressForm.control} name="state" render={({ field }) => (
                                <FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                         </div>
                         <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <FormField control={addressForm.control} name="zip" render={({ field }) => (
                                <FormItem><FormLabel>ZIP Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={addressForm.control} name="phone" render={({ field }) => (
                                <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                         </div>
                        <div className="flex justify-end">
                            <Button type="submit">Save Address</Button>
                        </div>
                    </form>
                    </Form>
                </CardContent>
            </Card>

            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className='text-destructive'>Danger Zone</CardTitle>
                    <CardDescription>These actions are permanent and cannot be undone.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                    <p className='font-medium'>Delete your account</p>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Account
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your
                                account and remove your data from our servers.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteAccount} className='bg-destructive hover:bg-destructive/90'>
                                Yes, delete my account
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>
        </div>
      </div>
    </MainLayout>
  );
}
