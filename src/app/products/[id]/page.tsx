
"use client";

import { SimpleLayout } from "@/components/layouts/SimpleLayout";
import { ProductImageGallery } from "@/components/ProductImageGallery";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Star, Truck, ShoppingCart, Heart, Check } from 'lucide-react';
import { ProductRecommendations } from "@/components/ProductRecommendations";
import { Badge } from "@/components/ui/badge";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useProducts } from "@/hooks/use-products.tsx";
import type { Product } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useStoreSettings } from "@/hooks/use-store-settings";

export default function ProductPage() {
  const params = useParams();
  const productId = typeof params.id === 'string' ? params.id : '';
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const { products: allProducts, getProductById } = useProducts();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { settings } = useStoreSettings();

  useEffect(() => {
    async function fetchProductData() {
        setLoading(true);
        const foundProduct = await getProductById(productId);
        setProduct(foundProduct);
        setLoading(false);
    }
    if(productId) {
        fetchProductData();
    }
  }, [productId, getProductById]);

  const handleAddToCart = () => {
    if (product && !isAdding) {
      setIsAdding(true);
      addToCart(product, 1, () => {
        setTimeout(() => setIsAdding(false), 2000);
      });
    }
  }


  if (loading) {
    return (
        <SimpleLayout>
            <div className="container mx-auto max-w-6xl px-4 py-8">
                <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                    <div>
                        <Skeleton className="w-full aspect-square rounded-xl"/>
                        <div className="grid grid-cols-5 gap-3 mt-4">
                            {[...Array(4)].map((_, i) => <Skeleton key={i} className="w-full aspect-square rounded-lg" />)}
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 py-4">
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-8 w-1/4" />
                        <Separator />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
            </div>
        </SimpleLayout>
    )
  }


  if (!product) {
    return (
      <SimpleLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
        </div>
      </SimpleLayout>
    );
  }

  const isWishlisted = isInWishlist(product.id);

  return (
    <SimpleLayout>
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          <div className="md:col-span-1">
            <ProductImageGallery images={product.images} />
          </div>
          <div className="flex flex-col gap-4 py-4 md:col-span-1">
            <h1 className="text-3xl md:text-4xl font-bold font-headline">{product.name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-primary">
                {[...Array(Math.floor(product.rating))].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
                {product.rating % 1 !== 0 && <Star className="w-5 h-5 fill-current" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }} />}
                <span className="text-muted-foreground ml-2 text-sm">({product.rating})</span>
              </div>
              <Separator orientation="vertical" className="h-5" />
              <Badge variant={product.stock > 0 ? "secondary" : "destructive"}>
                {product.stock > 0 ? `In Stock: ${product.stock}` : "Out of Stock"}
              </Badge>
            </div>
            <p className="text-3xl font-bold text-foreground">{settings.currencySymbol}{product.price.toFixed(2)}</p>
            <Separator />
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            <div className="flex items-stretch gap-4 mt-4">
              <Button type="button" size="lg" className="flex-1" onClick={handleAddToCart} disabled={product.stock === 0 || isAdding}>
                {isAdding ? (
                   <>
                    <Check className="mr-2 h-5 w-5" />
                    Added!
                   </>
                ) : (
                   <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                   </>
                )}
              </Button>
              <Button type="button" size="lg" variant="outline" className="p-3" onClick={() => toggleWishlist(product)}>
                <Heart className={cn("h-5 w-5", isWishlisted && "fill-destructive text-destructive")} />
                <span className="sr-only">Add to Wishlist</span>
              </Button>
            </div>
          </div>
        </div>
        <Separator className="my-12" />
        <ProductRecommendations currentProduct={product} allProducts={allProducts} />
      </div>
    </SimpleLayout>
  );
}
