
import Image from "next/image";
import type { Order } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import Link from "next/link";
import { useStoreSettings } from "@/hooks/use-store-settings";

interface OrderCardProps {
  order: Order;
}

const statusColors: { [key in Order['status']]: string } = {
    Pending: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
    Packed: "bg-blue-500/20 text-blue-700 border-blue-500/30",
    Shipped: "bg-purple-500/20 text-purple-700 border-purple-500/30",
    Delivered: "bg-green-500/20 text-green-700 border-green-500/30",
    Canceled: "bg-red-500/20 text-red-700 border-red-500/30",
};


export function OrderCard({ order }: OrderCardProps) {
    const { settings } = useStoreSettings();
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-start">
        <div>
          <CardTitle>Order #{order.id.slice(-6)}</CardTitle>
          <p className="text-sm text-muted-foreground">Date: {new Date(order.date).toLocaleDateString()}</p>
        </div>
        <Badge variant="outline" className={cn("text-sm", statusColors[order.status])}>{order.status}</Badge>
      </CardHeader>
      <Separator />
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {order.items.map(item => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="relative h-16 w-16 rounded-md overflow-hidden">
                <Image src={item.images[0]} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-grow">
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <p className="font-semibold">{settings.currencySymbol}{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="flex justify-between items-center p-4 bg-muted/50">
        <span className="font-bold text-lg">Total: {settings.currencySymbol}{order.total.toFixed(2)}</span>
        <Button variant="outline" asChild>
          <Link href={`/orders/${order.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
