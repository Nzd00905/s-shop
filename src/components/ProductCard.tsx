
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useStoreSettings } from "@/hooks/use-store-settings";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { settings } = useStoreSettings();
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg rounded-lg border-transparent group bg-card">
      <Link href={`/products/${product.id}`} className="flex flex-col h-full">
        <div className="aspect-square relative overflow-hidden rounded-t-lg">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="product photo"
          />
           {product.stock === 0 && <Badge variant="destructive" className="absolute top-2 left-2">Out of Stock</Badge>}
        </div>
        <CardContent className="p-4 flex-grow flex flex-col">
          <h3 className="text-base font-semibold leading-tight mb-2 font-body flex-grow">{product.name}</h3>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1 text-primary">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'fill-muted stroke-muted-foreground'}`} />
                ))}
            </div>
            <span className="text-xs text-muted-foreground">({product.rating.toFixed(1)})</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="flex justify-between items-center w-full">
            <p className="text-lg font-bold text-foreground">{settings.currencySymbol}{product.price.toFixed(2)}</p>
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}
