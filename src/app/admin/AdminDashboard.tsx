
'use client';

import {
  Activity,
  DollarSign,
  Users,
  CreditCard,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useOrders } from '@/hooks/use-orders';
import { useEffect, useState } from 'react';
import { useStoreSettings } from '@/hooks/use-store-settings';

export default function AdminDashboard() {
  const { orders, isLoaded } = useOrders();
  const { settings } = useStoreSettings();
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [uniqueCustomers, setUniqueCustomers] = useState(0);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);

  useEffect(() => {
    if (isLoaded && orders.length > 0) {
      const activeOrders = orders.filter(order => order.status !== 'Canceled');
      
      const revenue = activeOrders.reduce((acc, order) => acc + order.total, 0);
      setTotalRevenue(revenue);

      const sales = activeOrders.reduce((acc, order) => acc + order.items.reduce((itemAcc, item) => itemAcc + item.quantity, 0), 0);
      setTotalSales(sales);
      
      const customerEmails = new Set(orders.map(order => order.shippingAddress.fullName));
      setUniqueCustomers(customerEmails.size);
      
      setActiveOrdersCount(activeOrders.length);
    }
  }, [isLoaded, orders]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{settings.currencySymbol}{totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Customers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{uniqueCustomers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{totalSales}</div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{activeOrdersCount}</div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
