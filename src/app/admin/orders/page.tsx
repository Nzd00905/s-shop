
'use client';

import { useOrders } from "@/hooks/use-orders"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import type { OrderStatus, Order } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Home, Phone, User, ExternalLink } from "lucide-react"
import Link from "next/link";
import { useStoreSettings } from "@/hooks/use-store-settings"


const statusColors: { [key in Order['status']]: string } = {
    Pending: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
    Packed: "bg-blue-500/20 text-blue-700 border-blue-500/30",
    Shipped: "bg-purple-500/20 text-purple-700 border-purple-500/30",
    Delivered: "bg-green-500/20 text-green-700 border-green-500/30",
    Canceled: "bg-red-500/20 text-red-700 border-red-500/30",
};

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus, isLoaded } = useOrders()
  const { settings } = useStoreSettings();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const getSubtotal = (order: Order) => order.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <>
        <Card>
            <CardHeader>
                <CardTitle>Manage Orders</CardTitle>
                <CardDescription>View and manage all customer orders.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead className="hidden md:table-cell">Date</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!isLoaded ? (
                            Array.from({length: 5}).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-7 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                                </TableRow>
                            ))
                        ) : orders.length > 0 ? (
                            orders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">#{order.id.slice(-6)}</TableCell>
                                    <TableCell>{order.shippingAddress.fullName}</TableCell>
                                    <TableCell className="hidden md:table-cell">{new Date(order.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{settings.currencySymbol}{(order.total).toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn("text-xs", statusColors[order.status])}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="outline" onClick={() => setSelectedOrder(order)}>View Details</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">No orders found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        {selectedOrder && (
            <Dialog open={!!selectedOrder} onOpenChange={(isOpen) => !isOpen && setSelectedOrder(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Order Details #{selectedOrder.id.slice(-6)}</DialogTitle>
                    </DialogHeader>
                    <div className="grid md:grid-cols-2 gap-8 py-4 max-h-[70vh] overflow-y-auto px-1">
                        <div className="flex flex-col gap-6">
                             <div>
                                <h3 className="font-semibold mb-2">Items</h3>
                                <div className="flex flex-col gap-2">
                                {selectedOrder.items.map((item) => (
                                     <Link href={`/products/${item.id}`} key={item.id} className="block hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                                                <Image src={item.images[0]} alt={item.name} fill className="object-cover" />
                                            </div>
                                            <div className="flex-grow">
                                                <p className="font-semibold">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-semibold text-sm">{settings.currencySymbol}{(item.price * item.quantity).toFixed(2)}</p>
                                            <ExternalLink className="h-4 w-4 text-muted-foreground"/>
                                        </div>
                                    </Link>
                                ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Order Summary</h3>
                                <div className="grid gap-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>{settings.currencySymbol}{getSubtotal(selectedOrder).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Shipping</span>
                                        <span>{settings.currencySymbol}{selectedOrder.shippingFee.toFixed(2)}</span>
                                    </div>
                                    <Separator className="my-2"/>
                                    <div className="flex justify-between font-bold text-base">
                                        <span>Total</span>
                                        <span>{settings.currencySymbol}{selectedOrder.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div>
                                <h3 className="font-semibold mb-2">Customer & Shipping</h3>
                                <div className="grid gap-3 text-sm">
                                    <div className="flex items-start gap-3">
                                        <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <p className="font-medium">{selectedOrder.shippingAddress.fullName}</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Home className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <p>{selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}</p>
                                    </div>
                                     <div className="flex items-start gap-3">
                                        <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <p>{selectedOrder.shippingAddress.phone}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                 <h3 className="font-semibold mb-2">Update Status</h3>
                                 <Select 
                                    value={selectedOrder.status} 
                                    onValueChange={(newStatus) => {
                                        updateOrderStatus(selectedOrder.id, newStatus as OrderStatus)
                                        setSelectedOrder(prev => prev ? {...prev, status: newStatus as OrderStatus} : null)
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Update status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Packed">Packed</SelectItem>
                                        <SelectItem value="Shipped">Shipped</SelectItem>
                                        <SelectItem value="Delivered">Delivered</SelectItem>
                                        <SelectItem value="Canceled">Canceled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )}
    </>
  )
}
