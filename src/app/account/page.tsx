
'use client';

import { MainLayout } from "@/components/layouts/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ChevronRight, Package, User, Settings, LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FullPageLoader } from "@/components/ui/loader";

const menuItems = [
    { label: "My Orders", href: "/orders", icon: Package },
    { label: "Profile", href: "/account/profile", icon: User },
    { label: "Settings", href: "/account/settings", icon: Settings },
];

export default function AccountPage() {
    const { user, logout, isLoaded } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && !user) {
            router.push('/login');
        }
    }, [user, isLoaded, router]);

    if (!isLoaded || !user) {
        return <FullPageLoader />;
    }

    return (
        <MainLayout>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl md:text-4xl font-headline font-bold mb-6 text-center">My Account</h1>
                <div className="max-w-md mx-auto">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={user.avatar || ''} alt="User" data-ai-hint="user avatar" />
                                    <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="text-xl font-bold">{user.name}</h2>
                                    <p className="text-muted-foreground">{user.email}</p>
                                </div>
                            </div>
                            <Separator />
                            <ul className="divide-y mt-2">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link href={item.href} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                                            <item.icon className="h-5 w-5 text-muted-foreground" />
                                            <span className="flex-grow text-lg">{item.label}</span>
                                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                        </Link>
                                    </li>
                                ))}
                                <li>
                                    <button onClick={logout} className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-destructive">
                                        <LogOut className="h-5 w-5" />
                                        <span className="flex-grow text-lg text-left">Log Out</span>
                                    </button>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
