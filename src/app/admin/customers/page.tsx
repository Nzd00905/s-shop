
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Search, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo, useEffect } from "react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAllUsers } from "@/hooks/use-all-users";
import type { User } from '@/hooks/use-user';
import type { ShippingAddress } from "@/lib/types";

const editCustomerSchema = z.object({
    name: z.string().min(2, "Full name is required"),
    email: z.string().email(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
});


export default function AdminCustomersPage() {
    const { users, isLoaded, updateUser, deleteUser } = useAllUsers();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingCustomer, setEditingCustomer] = useState<User | null>(null);
    const [customerToDelete, setCustomerToDelete] = useState<User | null>(null);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof editCustomerSchema>>({
        resolver: zodResolver(editCustomerSchema),
    });

    useEffect(() => {
        if (editingCustomer) {
            form.reset({
                name: editingCustomer.name || '',
                email: editingCustomer.email || '',
                phone: editingCustomer.shippingAddress?.phone || '',
                address: editingCustomer.shippingAddress?.address || '',
                city: editingCustomer.shippingAddress?.city || '',
                state: editingCustomer.shippingAddress?.state || '',
                zip: editingCustomer.shippingAddress?.zip || '',
            });
        }
    }, [editingCustomer, form]);

    const filteredCustomers = useMemo(() => {
        if (!searchTerm) return users;
        return users.filter(customer =>
            customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, users]);

    const handleUpdateCustomer = (values: z.infer<typeof editCustomerSchema>) => {
        if (!editingCustomer) return;
        
        const updatedUserData: Partial<User> = {
            name: values.name,
            shippingAddress: {
                ...editingCustomer.shippingAddress,
                fullName: values.name || '',
                phone: values.phone || '',
                address: values.address || '',
                city: values.city || '',
                state: values.state || '',
                zip: values.zip || '',
            } as ShippingAddress
        };

        updateUser(editingCustomer.uid, updatedUserData);

        toast({ title: 'Success', description: 'Customer information updated.', variant: 'success' });
        setEditingCustomer(null);
    };

    const handleDeleteCustomer = () => {
        if (!customerToDelete) return;
        deleteUser(customerToDelete.uid);
        setCustomerToDelete(null);
    };

    return (
        <Dialog open={!!editingCustomer} onOpenChange={(isOpen) => !isOpen && setEditingCustomer(null)}>
            <AlertDialog onOpenChange={(isOpen) => !isOpen && setCustomerToDelete(null)}>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Customers</CardTitle>
                            <CardDescription>A list of all registered users.</CardDescription>
                        </div>
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by name or email..." 
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!isLoaded ? (
                                    Array.from({length: 5}).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                                            <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredCustomers.length > 0 ? (
                                    filteredCustomers.map((customer) => (
                                        <TableRow key={customer.uid}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={customer.avatar || ''} alt={customer.name || ''} />
                                                        <AvatarFallback>{customer.name?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium">{customer.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                            {customer.email}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                {customer.shippingAddress?.phone}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => setEditingCustomer(customer)}>
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            No customers found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Customer Information</DialogTitle>
                    </DialogHeader>
                    {editingCustomer && (
                        <form onSubmit={form.handleSubmit(handleUpdateCustomer)} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" {...form.register("name")} />
                                {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" {...form.register("email")} disabled />
                                {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" {...form.register("phone")} />
                                {form.formState.errors.phone && <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address">Address</Label>
                                <Input id="address" {...form.register("address")} />
                                {form.formState.errors.address && <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>}
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <Label htmlFor="city">City</Label>
                                    <Input id="city" {...form.register("city")} />
                                    {form.formState.errors.city && <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="state">State</Label>
                                    <Input id="state" {...form.register("state")} />
                                    {form.formState.errors.state && <p className="text-sm text-destructive">{form.formState.errors.state.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="zip">ZIP</Label>
                                    <Input id="zip" {...form.register("zip")} />
                                    {form.formState.errors.zip && <p className="text-sm text-destructive">{form.formState.errors.zip.message}</p>}
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                                <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>

                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the account for {customerToDelete?.name} and all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteCustomer} className="bg-destructive hover:bg-destructive/90">
                            Yes, delete customer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Dialog>
    );
}
