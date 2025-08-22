
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Search, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { useProducts } from '@/hooks/use-products';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
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
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EditProductForm } from './EditProductForm';
import type { Product } from '@/lib/types';
import { useStoreSettings } from '@/hooks/use-store-settings';


export function ProductList() {
  const { products, isLoaded, deleteProduct } = useProducts();
  const { settings } = useStoreSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) {
      return products;
    }
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, products]);

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
  }

  return (
    <Dialog open={!!editingProduct} onOpenChange={(isOpen) => !isOpen && setEditingProduct(null)}>
        <Card>
        <CardHeader>
            <div className='flex justify-between items-start'>
                <div>
                    <CardTitle>Products</CardTitle>
                    <CardDescription>
                    Manage your products and view their sales performance.
                    </CardDescription>
                </div>
                <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by name..." 
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                    <span className="sr-only">Image</span>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Price</TableHead>
                <TableHead className="hidden md:table-cell">
                    Stock
                </TableHead>
                <TableHead>
                    <span className="sr-only">Actions</span>
                </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {!isLoaded ? (
                    Array.from({length: 5}).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell className="hidden sm:table-cell"><Skeleton className="h-12 w-12 rounded-md" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-7 w-20" /></TableCell>
                            <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-16" /></TableCell>
                            <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-12" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                        </TableRow>
                    ))
                ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                            <TableCell className="hidden sm:table-cell">
                            <Image
                                alt={product.name}
                                className="aspect-square rounded-md object-cover"
                                height="64"
                                src={product.images[0]}
                                width="64"
                            />
                            </TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>
                            <Badge variant={product.stock > 0 ? 'outline' : 'destructive'}>
                                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                            </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                {settings.currencySymbol}{product.price.toFixed(2)}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{product.stock}</TableCell>
                            <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DialogTrigger asChild>
                                    <DropdownMenuItem onSelect={() => handleEditClick(product)}>
                                        <Pencil className="mr-2 h-4 w-4"/>
                                        Edit
                                    </DropdownMenuItem>
                                </DialogTrigger>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem className='text-destructive' onSelect={(e) => e.preventDefault()}>
                                            <Trash2 className="mr-2 h-4 w-4"/>
                                            Delete
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the product "{product.name}".
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => deleteProduct(product.id)} className="bg-destructive hover:bg-destructive/90">
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                            No products found.
                        </TableCell>
                    </TableRow>
                )}
                
            </TableBody>
            </Table>
        </CardContent>
        </Card>

        {editingProduct && (
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Product</DialogTitle>
                </DialogHeader>
                <EditProductForm product={editingProduct} onFinished={() => setEditingProduct(null)} />
            </DialogContent>
        )}
    </Dialog>
  );
}
