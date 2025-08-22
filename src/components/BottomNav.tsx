
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Heart, LayoutGrid, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/categories', label: 'Category', icon: LayoutGrid },
  { href: '/account', label: 'Account', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto grid h-16 grid-cols-5 max-w-md">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-xs transition-colors',
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground'
              )}
            >
              <item.icon className={cn("h-6 w-6")} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
