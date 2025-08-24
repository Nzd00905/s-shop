
"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { Banner } from "@/lib/types";
import { Skeleton } from "./ui/skeleton";

interface PromoBannerProps {
  banners: Banner[];
  isLoaded: boolean;
}

export function PromoBanner({ banners, isLoaded }: PromoBannerProps) {
  if (!isLoaded) {
    return (
       <div className="p-1">
          <Skeleton className="w-full aspect-[3/1]" />
       </div>
    )
  }

  if (!banners || banners.length === 0) {
    return (
      <div className="p-1">
        <Card className="overflow-hidden">
          <CardContent className="flex aspect-[3/1] items-center justify-center p-0 relative bg-muted">
            <p className="text-muted-foreground">No banners to display.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Carousel className="w-full" opts={{ loop: true }}>
      <CarouselContent>
        {banners.map((banner, index) => (
          <CarouselItem key={banner.id}>
            <div className="p-1">
              <Card className="overflow-hidden">
                <CardContent className="flex aspect-[3/1] items-center justify-center p-0 relative">
                  <Image 
                    src={banner.image}
                    alt={banner.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    data-ai-hint={banner.dataAiHint}
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <h2 className="text-3xl md:text-5xl font-bold text-white font-headline drop-shadow-lg">{banner.title}</h2>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex" />
      <CarouselNext className="hidden md:flex" />
    </Carousel>
  );
}
