
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { X, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import { useCategories } from "@/hooks/use-categories";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCategoriesPage() {
    const { categories, addCategory, updateCategory, deleteCategory, isLoaded } = useCategories();
    const [newCategory, setNewCategory] = useState('');
    const { toast } = useToast();
    
    const [editingCategory, setEditingCategory] = useState<{ id: string, name: string } | null>(null);
    const [editingValue, setEditingValue] = useState('');
    const [categoryToDelete, setCategoryToDelete] = useState<{ id: string, name: string } | null>(null);


    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategory.trim() === '') {
            toast({ title: 'Error', description: 'Category name cannot be empty.', variant: 'destructive' });
            return;
        }
        if (categories.some(c => c.name.toLowerCase() === newCategory.trim().toLowerCase())) {
            toast({ title: 'Error', description: 'Category already exists.', variant: 'destructive' });
            return;
        }
        addCategory(newCategory.trim());
        setNewCategory('');
    };
    
    const handleDeleteCategory = () => {
        if (!categoryToDelete) return;
        deleteCategory(categoryToDelete.id);
        setCategoryToDelete(null);
    }

    const handleEditClick = (category: { id: string, name: string }) => {
        setEditingCategory(category);
        setEditingValue(category.name);
    }

    const handleUpdateCategory = () => {
        if (!editingCategory) return;
        if (editingValue.trim() === '') {
            toast({ title: 'Error', description: 'Category name cannot be empty.', variant: 'destructive' });
            return;
        }
        if (categories.some(c => c.name.toLowerCase() === editingValue.trim().toLowerCase() && c.id !== editingCategory.id)) {
            toast({ title: 'Error', description: 'Category already exists.', variant: 'destructive' });
            return;
        }

        updateCategory(editingCategory.id, editingValue.trim());
        setEditingCategory(null);
        setEditingValue('');
    }

    return (
        <Dialog onOpenChange={(isOpen) => !isOpen && setEditingCategory(null)}>
        <AlertDialog onOpenChange={(isOpen) => !isOpen && setCategoryToDelete(null)}>
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Category</CardTitle>
                        <CardDescription>Create a new category for your products.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddCategory} className="flex items-end gap-4">
                            <div className="flex-grow">
                                <Label htmlFor="category-name">Category Name</Label>
                                <Input
                                    id="category-name"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    placeholder="e.g., 'Footwear'"
                                />
                            </div>
                            <Button type="submit">Add Category</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Existing Categories</CardTitle>
                        <CardDescription>Manage your current product categories.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!isLoaded ? (
                            <div className="flex flex-wrap gap-3">
                                {Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="h-8 w-24 rounded-full" />)}
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-3">
                                {categories.map((category) => (
                                    <div key={category.id} className="group flex items-center gap-1 bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm font-medium transition-all hover:bg-muted/80">
                                        <span>{category.name}</span>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full ml-1 opacity-50 group-hover:opacity-100" onClick={() => handleEditClick(category)}>
                                                <Pencil className="h-3 w-3" />
                                            </Button>
                                        </DialogTrigger>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full opacity-50 group-hover:opacity-100" onClick={() => setCategoryToDelete(category)}>
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </AlertDialogTrigger>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                 {/* Edit Dialog Content */}
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="edit-category-name">Category Name</Label>
                        <Input 
                            id="edit-category-name" 
                            value={editingValue} 
                            onChange={(e) => setEditingValue(e.target.value)} 
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                             <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button onClick={handleUpdateCategory}>Save Changes</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
                
                {/* Delete Dialog Content */}
                {categoryToDelete && (
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will delete the category "{categoryToDelete.name}". This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive hover:bg-destructive/90">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                )}
            </div>
        </AlertDialog>
        </Dialog>
    );
}
