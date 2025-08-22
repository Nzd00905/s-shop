
'use client';

import { MainLayout } from "@/components/layouts/MainLayout";
import { ProductGrid } from "@/components/ProductGrid";
import { useProducts } from "@/hooks/use-products";
import { useParams, notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryPage() {
  const params = useParams();
  const { products, isLoaded } = useProducts();
  const categoryName = decodeURIComponent(params.slug as string);
  
  if (isLoaded && !products.some(p => p.category === categoryName)) {
    notFound();
  }

  const filteredProducts = products.filter(p => p.category === categoryName);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-headline font-bold mb-6 text-center">{categoryName}</h1>
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
        ) : (
          <ProductGrid products={filteredProducts} />
        )}
      </div>
    </MainLayout>
  );
}
