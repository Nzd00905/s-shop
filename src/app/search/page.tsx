
'use client';

import { useState, useMemo, useEffect } from 'react';
import { MainLayout } from "@/components/layouts/MainLayout";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";
import { ProductGrid } from "@/components/ProductGrid";
import { useProducts } from '@/hooks/use-products.tsx';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { products, isLoaded } = useProducts();

  const filteredProducts = useMemo(() => {
    if (!searchTerm) {
      return products;
    }
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, products]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-headline font-bold mb-6 text-center">Search Products</h1>
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for watches, headphones, etc."
              className="pl-10 text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {!isLoaded ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-2">
                        <Skeleton className="w-full aspect-square rounded-lg" />
                        <Skeleton className="w-full h-5 mt-2" />
                        <Skeleton className="w-1/2 h-5" />
                    </div>
                ))}
            </div>
        ) : searchTerm && filteredProducts.length === 0 ? (
          <p className="text-center text-muted-foreground">No products found for "{searchTerm}".</p>
        ) : (
          <ProductGrid products={filteredProducts} />
        )}
      </div>
    </MainLayout>
  );
}
