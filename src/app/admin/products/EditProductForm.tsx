
'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProducts } from "@/hooks/use-products";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import type { Product } from "@/lib/types";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useCategories } from "@/hooks/use-categories";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EditProductFormProps {
    product: Product;
    onFinished: () => void;
}

const productSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    price: z.coerce.number().positive("Price must be a positive number"),
    stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
    categoryId: z.string().min(1, "Please select a category"),
})

export function EditProductForm({ product, onFinished }: EditProductFormProps) {
    const { updateProduct } = useProducts();
    const { categories } = useCategories();
    const [images, setImages] = useState<string[]>(product.images);
    const [imageError, setImageError] = useState('');
    const productCategoryId = categories.find(c => c.name === product.category)?.id || "";


    const form = useForm<z.infer<typeof productSchema>>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            categoryId: productCategoryId,
        }
    });

    useEffect(() => {
        const productCategoryId = categories.find(c => c.name === product.category)?.id || "";
        form.reset({
             name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            categoryId: productCategoryId,
        });
        setImages(product.images);
    }, [product, categories, form])

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        if (files.length + images.length > 5) {
            setImageError("You can upload a maximum of 5 images.");
            return;
        }
        
        const newImageFiles = Array.from(files);
        const imagePromises: Promise<string>[] = [];

        for (const file of newImageFiles) {
            if (file.size > 1024 * 1024) { // 1MB limit
                 setImageError("Each image file should be less than 1MB.");
                 return;
            }
            imagePromises.push(new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    resolve(event.target?.result as string);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            }));
        }
        
        Promise.all(imagePromises).then(newImages => {
            setImages(prev => [...prev, ...newImages]);
            setImageError('');
        }).catch(error => {
            console.error("Error reading files:", error);
            setImageError("There was an error uploading the images.");
        });
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmit = (values: z.infer<typeof productSchema>) => {
        if (images.length === 0) {
            setImageError("Please upload at least one image.");
            return;
        }
        const categoryName = categories.find(c => c.id === values.categoryId)?.name || 'Uncategorized';
        updateProduct(product.id, { ...values, images, category: categoryName });
        onFinished();
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <ScrollArea className="h-[70vh] pr-6">
                    <div className="grid gap-6 py-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><Label>Product Name</Label><FormControl><Input placeholder="e.g. Wireless Headphones" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><Label>Description</Label><FormControl><Textarea placeholder="Describe the product" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="price" render={({ field }) => (
                                <FormItem><Label>Price</Label><FormControl><Input type="number" placeholder="99.99" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="stock" render={({ field }) => (
                                <FormItem><Label>Stock</Label><FormControl><Input type="number" placeholder="50" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                        <FormField control={form.control} name="categoryId" render={({ field }) => (
                            <FormItem>
                                <Label>Category</Label>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <div className="grid gap-2">
                            <Label>Product Images (Max 5)</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {images.map((image, index) => (
                                    <div key={index} className="relative group">
                                        <Image src={image} alt={`preview ${index}`} width={100} height={100} className="rounded-md object-cover w-full aspect-square" />
                                        <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => removeImage(index)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {images.length < 5 && (
                                    <Label htmlFor="image-upload-edit" className="cursor-pointer aspect-square border-2 border-dashed border-muted-foreground/50 rounded-lg flex items-center justify-center">
                                        <Upload className="h-8 w-8 text-muted-foreground" />
                                    </Label>
                                )}
                            </div>
                            <Input id="image-upload-edit" type="file" multiple accept="image/*" className="sr-only" onChange={handleImageUpload} />
                            {imageError && <p className="text-sm text-destructive">{imageError}</p>}
                        </div>
                    </div>
                </ScrollArea>
                <DialogFooter className="pt-4 border-t mt-4">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Save Changes</Button>
                </DialogFooter>
            </form>
        </Form>
    )
}
