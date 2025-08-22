
"use client";

import { useState, useEffect } from "react";
import { productRecommendations } from "@/ai/flows/product-recommendations";
import type { Product } from "@/lib/types";
import { ProductGrid } from "./ProductGrid";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductRecommendationsProps {
  currentProduct: Product;
  allProducts: Product[];
}

export function ProductRecommendations({ currentProduct, allProducts }: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getRecommendations() {
      setLoading(true);
      try {
        // In a real app, viewing history would be stored and retrieved for the user.
        // Here, we simulate it with the current product and its category.
        const viewingHistory = [
          currentProduct.name, 
          ...allProducts
            .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
            .slice(0, 2)
            .map(p => p.name)
        ];

        const result = await productRecommendations({ viewingHistory });
        
        let recommendedProducts = allProducts.filter(p => result.recommendations.includes(p.name) && p.id !== currentProduct.id);
        
        // If AI gives too few results, fill with other products from the same category
        if(recommendedProducts.length < 4) {
          const categoryProducts = allProducts.filter(p => p.category === currentProduct.category && p.id !== currentProduct.id && !recommendedProducts.some(rp => rp.id === p.id));
          recommendedProducts.push(...categoryProducts.slice(0, 4 - recommendedProducts.length));
        }

        setRecommendations(recommendedProducts.slice(0, 4));

      } catch (error) {
        console.error("AI recommendation failed, falling back to category-based:", error);
        // Fallback to simple category-based recommendation on any error
        const categoryProducts = allProducts
            .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
            .slice(0, 4);
        setRecommendations(categoryProducts);
      } finally {
        setLoading(false);
      }
    }

    if (allProducts.length > 0) {
      getRecommendations();
    }
  }, [currentProduct, allProducts]);

  if (loading) {
     return (
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-bold mb-6 text-center">You Might Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="w-full h-48" />
                  <Skeleton className="w-3/4 h-6" />
                  <Skeleton className="w-1/4 h-6" />
                </div>
              ))}
            </div>
        </section>
      )
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl md:text-3xl font-headline font-bold mb-6 text-center">You Might Also Like</h2>
      <ProductGrid products={recommendations} />
    </section>
  );
}



