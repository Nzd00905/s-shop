
"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProductImageGalleryProps {
  images: string[];
}

export function ProductImageGallery({ images }: ProductImageGalleryProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto">
      <Carousel setApi={setApi} className="w-full group">
        <CarouselContent>
          {images.map((src, index) => (
            <CarouselItem key={index}>
              <Card className="overflow-hidden rounded-xl shadow-lg border-0">
                <CardContent className="p-0 aspect-square relative">
                  <Image
                    src={src}
                    alt={`Product image ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    data-ai-hint="product detail"
                  />
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        <CarouselNext className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Carousel>
      <div className="grid grid-cols-5 gap-3">
        {images.map((src, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={cn(
              "overflow-hidden rounded-lg aspect-square relative border-2 transition-all duration-200",
              index === current ? "border-primary ring-2 ring-primary/50" : "border-transparent opacity-60 hover:opacity-100 hover:border-muted-foreground/50"
            )}
          >
            <Image
              src={src}
              alt={`Thumbnail ${index + 1}`}
              fill
              className="object-cover"
              sizes="20vw"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
