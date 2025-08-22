
'use client';

import { MainLayout } from "@/components/layouts/MainLayout";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { Skeleton } from "@/components/ui/skeleton";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, isLoaded } = useWishlist();

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-headline font-bold mb-6 text-center">My Wishlist</h1>
        {!isLoaded ? (
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-2">
                      <Skeleton className="w-full aspect-square rounded-lg" />
                      <Skeleton className="w-full h-5 mt-2" />
                      <Skeleton className="w-1/2 h-5" />
                  </div>
              ))}
          </div>
        ) : wishlist.length > 0 ? (
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {wishlist.map((product) => (
              <div key={product.id} className="relative group">
                <ProductCard product={product} />
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFromWishlist(product.id)}
                  aria-label="Remove from wishlist"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Your wishlist is empty.</p>
        )}
      </div>
    </MainLayout>
  );
}
