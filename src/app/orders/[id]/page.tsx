
"use client";

import { SimpleLayout } from "@/components/layouts/SimpleLayout";
import { useOrders } from "@/hooks/use-orders";
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, User, Home, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useStoreSettings } from "@/hooks/use-store-settings";

const statusColors: { [key in Order['status']]: string } = {
    Pending: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
    Packed: "bg-blue-500/20 text-blue-700 border-blue-500/30",
    Shipped: "bg-purple-500/20 text-purple-700 border-purple-500/30",
    Delivered: "bg-green-500/20 text-green-700 border-green-500/30",
    Canceled: "bg-red-500/20 text-red-700 border-red-500/30",
};

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = typeof params.id === 'string' ? params.id : '';
  const { orders, isLoaded } = useOrders();
  const { settings } = useStoreSettings();
  const order = orders.find((o) => o.id === orderId);

  if (!isLoaded) {
    return (
        <SimpleLayout>
            <div className="container mx-auto max-w-4xl px-4 py-8">
                 <Skeleton className="h-10 w-48 mb-6" />
                 <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <Skeleton className="h-96 w-full" />
                    </div>
                    <div className="md:col-span-1">
                        <Skeleton className="h-48 w-full" />
                    </div>
                 </div>
            </div>
        </SimpleLayout>
    )
  }

  if (!order) {
    notFound();
  }
  
  const subtotal = order.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <SimpleLayout>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
            <Button variant="ghost" asChild>
                <Link href="/orders">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to My Orders
                </Link>
            </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2">
                <Card>
                    <CardHeader className="flex flex-row justify-between items-start">
                        <div>
                        <CardTitle>Order #{order.id.slice(-6)}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Date: {new Date(order.date).toLocaleDateString()}
                        </p>
                        </div>
                        <Badge variant="outline" className={cn("text-sm", statusColors[order.status])}>
                        {order.status}
                        </Badge>
                    </CardHeader>
                    <Separator />
                    <CardContent className="p-4 md:p-6">
                        <h3 className="text-lg font-semibold mb-4">Items</h3>
                        <div className="flex flex-col gap-2">
                        {order.items.map((item) => (
                            <Link href={`/products/${item.id}`} key={item.id} className="block hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors">
                                <div className="flex items-center gap-4">
                                <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                                    <Image
                                    src={item.images[0]}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                    />
                                </div>
                                <div className="flex-grow">
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                    Qty: {item.quantity}
                                    </p>
                                </div>
                                <p className="font-semibold">
                                    {settings.currencySymbol}{(item.price * item.quantity).toFixed(2)}
                                </p>
                                </div>
                            </Link>
                        ))}
                        </div>
                        <Separator className="my-6" />
                        <div className="grid gap-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{settings.currencySymbol}{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping</span>
                                <span>{settings.currencySymbol}{order.shippingFee.toFixed(2)}</span>
                            </div>
                            <Separator className="my-2"/>
                            <div className="flex justify-between font-bold text-base">
                                <span>Total</span>
                                <span>{settings.currencySymbol}{order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Shipping Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 text-sm">
                        <div className="flex items-start gap-3">
                            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="font-medium">{order.shippingAddress.fullName}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Home className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p>{order.shippingAddress.address}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p>{order.shippingAddress.phone}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </SimpleLayout>
  );
}
