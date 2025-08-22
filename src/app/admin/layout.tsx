
'use client';

import type { ReactNode } from "react";
import Link from "next/link";
import {
  Bell,
  Home,
  LineChart,
  Menu,
  Package,
  Package2,
  ShoppingCart,
  Users,
  LayoutGrid,
  Settings,
} from "lucide-react"
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { FullPageLoader } from "@/components/ui/loader";

const navLinks = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/categories", label: "Categories", icon: LayoutGrid },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthChecked, setIsAuthChecked] = useState(false);

    useEffect(() => {
        const adminLoggedIn = localStorage.getItem('adminLoggedIn');
        if (adminLoggedIn === 'true') {
            setIsAuthenticated(true);
        } else if (pathname !== '/admin/login') {
            router.push('/admin/login');
        }
        setIsAuthChecked(true);
    }, [pathname, router]);

    const logout = () => {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUsername');
        setIsAuthenticated(false);
        router.push('/admin/login');
    };

    if (pathname === '/admin/login') {
        return <>{children}</>;
    }
    
    if (!isAuthChecked) {
        return null;
    }
    
    if (!isAuthenticated) {
        return <FullPageLoader />;
    }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <div className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              <span className="">Admin</span>
            </div>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                        pathname === link.href && "bg-muted text-primary"
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
                <SheetHeader>
                    <SheetTitle className="sr-only">Admin Menu</SheetTitle>
                </SheetHeader>
              <nav className="grid gap-2 text-lg font-medium">
                <div
                  className="flex items-center gap-2 text-lg font-semibold mb-4"
                >
                  <Package2 className="h-6 w-6" />
                  <span>Admin</span>
                </div>
                 {navLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                        "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground",
                        pathname === link.href && "bg-muted text-foreground"
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Can be used for page titles or search */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Users className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Admin</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}
