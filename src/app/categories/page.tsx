
'use client';

import { MainLayout } from "@/components/layouts/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { useMemo } from "react";

export default function CategoriesPage() {
  const { products } = useProducts();
  const categories = useMemo(() => [...new Set(products.map(p => p.category))], [products]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-headline font-bold mb-6 text-center">Categories</h1>
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y">
                {categories.map((category, index) => (
                  <li key={index}>
                    <Link href={`/categories/${encodeURIComponent(category)}`} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      <span className="text-lg">{category}</span>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
