
"use client";

import { SimpleLayout } from "@/components/layouts/SimpleLayout";
import { OrderCard } from "@/components/OrderCard";
import { useOrders } from "@/hooks/use-orders";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrdersPage() {
  const { userOrders, isLoaded } = useOrders();

  return (
    <SimpleLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-headline font-bold mb-6 text-center">My Orders</h1>
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          {!isLoaded ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)
          ) : userOrders.length > 0 ? (
            userOrders.map(order => <OrderCard key={order.id} order={order} />)
          ) : (
            <p className="text-center text-muted-foreground py-10">You have no orders yet.</p>
          )}
        </div>
      </div>
    </SimpleLayout>
  );
}
