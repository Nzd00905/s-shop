
"use client";

import Image from "next/image";
import { SimpleLayout } from "@/components/layouts/SimpleLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import Link from "next/link";
import { useStoreSettings } from "@/hooks/use-store-settings";

export default function CartPage() {
    const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
    const { settings } = useStoreSettings();

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shipping = settings.shippingFee;
    const total = subtotal + shipping;

    return (
        <SimpleLayout>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl md:text-4xl font-headline font-bold mb-8 text-center">Shopping Cart</h1>
                {cartItems.length > 0 ? (
                    <div className="flex flex-col lg:flex-row gap-12">
                        <div className="lg:w-2/3 flex flex-col gap-6">
                            {cartItems.map(item => (
                                <Card key={item.id} className="flex flex-col sm:flex-row items-center p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="relative h-24 w-24 aspect-square rounded-lg overflow-hidden flex-shrink-0">
                                        <Image src={item.images[0]} alt={item.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-grow ml-0 sm:ml-6 mt-4 sm:mt-0 text-center sm:text-left">
                                        <h2 className="font-bold text-lg">{item.name}</h2>
                                        <p className="text-muted-foreground">{settings.currencySymbol}{item.price.toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-4 sm:mt-0">
                                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                                        <Input type="number" value={item.quantity} readOnly className="h-8 w-16 text-center rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                                    </div>
                                    <Button variant="ghost" size="icon" className="ml-0 sm:ml-4 mt-4 sm:mt-0 text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.id)}>
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </Card>
                            ))}
                        </div>
                        <div className="lg:w-1/3">
                            <Card className="shadow-lg sticky top-24">
                                <CardHeader>
                                    <CardTitle>Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>{settings.currencySymbol}{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Shipping</span>
                                        <span>{shipping > 0 ? `${settings.currencySymbol}${shipping.toFixed(2)}` : 'Free'}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>{settings.currencySymbol}{total.toFixed(2)}</span>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button size="lg" className="w-full" asChild>
                                        <Link href="/checkout">Proceed to Checkout</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <ShoppingCart className="mx-auto h-24 w-24 text-muted-foreground" />
                        <h2 className="mt-6 text-2xl font-semibold">Your cart is empty</h2>
                        <p className="mt-2 text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
                        <Button asChild className="mt-6">
                            <Link href="/">Start Shopping</Link>
                        </Button>
                    </div>
                )}
            </div>
        </SimpleLayout>
    );
}
