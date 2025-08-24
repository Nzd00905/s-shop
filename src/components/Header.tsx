
'use client';

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { useEffect, useState } from "react";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { Skeleton } from "./ui/skeleton";

function CartButton() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isCartPage = pathname === '/cart';
  const totalItems = isMounted ? cartCount : 0;

  return (
    <Button asChild variant="ghost" size="icon" className={cn("relative rounded-full", isCartPage && "bg-accent text-accent-foreground")}>
      <Link href="/cart">
        <ShoppingCart className="h-5 w-5" />
        <span className="sr-only">Shopping Cart</span>
        {totalItems > 0 && (
          <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
            {totalItems}
          </div>
        )}
      </Link>
    </Button>
  );
}


export function Header() {
  const { settings, isLoaded } = useStoreSettings();
  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {isLoaded ? (
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold font-headline text-foreground">
              {settings.shopName}
            </span>
          </Link>
        ) : (
            <Skeleton className="h-10 w-32" />
        )}
        <div className="flex items-center gap-2">
          <CartButton />
        </div>
      </div>
    </header>
  );
}
