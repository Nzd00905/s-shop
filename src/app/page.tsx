
'use client';

import { MainLayout } from "@/components/layouts/MainLayout";
import { PromoBanner } from "@/components/PromoBanner";
import { ProductGrid } from "@/components/ProductGrid";
import { useProducts } from "@/hooks/use-products.tsx";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { products, isLoaded: productsLoaded } = useProducts();
  const { settings, isLoaded: settingsLoaded } = useStoreSettings();

  const isLoaded = productsLoaded && settingsLoaded;
  
  return (
    <MainLayout>
      <div className="flex flex-col gap-8 md:gap-12">
        <PromoBanner banners={settings.banners} isLoaded={isLoaded} />
        <section className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-headline font-bold mb-6 text-center">Featured Products</h2>
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
            <ProductGrid products={products} />
          )}
        </section>
      </div>
    </MainLayout>
  );
}
