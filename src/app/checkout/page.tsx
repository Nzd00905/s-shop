
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { SimpleLayout } from "@/components/layouts/SimpleLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useOrders } from "@/hooks/use-orders";
import { CreditCard, Landmark, Truck, Wallet, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useUser } from "@/hooks/use-user";
import { useEffect, useState } from "react";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { FullPageLoader } from "@/components/ui/loader";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zip: z.string().regex(/^\d{4}$/, "Must be a 4-digit ZIP code"),
  phone: z.string().regex(/^01[3-9]\d{8}$/, "Must be a valid 11-digit Bangladeshi number"),
  paymentMethod: z.enum(["cod"], { required_error: "You need to select a payment method." }),
});

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const { addOrder } = useOrders();
  const { settings } = useStoreSettings();
  const { toast } = useToast();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      phone: "",
      paymentMethod: "cod",
    },
  });

  useEffect(() => {
    if (isLoaded && !user) {
        router.push('/login');
    }
    if (isLoaded && user?.shippingAddress) {
        const { fullName, address, city, state, zip, phone } = user.shippingAddress;
        form.reset({
            fullName: fullName || user.name || "",
            address,
            city,
            state,
            zip,
            phone,
            paymentMethod: "cod"
        });
    } else if (isLoaded && user) {
        form.reset({
            fullName: user.name || "",
            paymentMethod: "cod"
        })
    }
  }, [isLoaded, user, router, form]);


  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = settings.shippingFee;
  const total = subtotal + shipping;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsProcessing(true);
    const shippingAddress = {
      fullName: values.fullName,
      address: values.address,
      city: values.city,
      state: values.state,
      zip: values.zip,
      phone: values.phone,
    };

    const orderId = await addOrder(cartItems, shippingAddress, total, shipping);

    if (orderId) {
        toast({
        title: "Order Placed!",
        description: "Your order has been successfully placed.",
        variant: "success",
        });
        clearCart();
        router.push(`/orders/${orderId}`);
    } else {
        setIsProcessing(false);
    }
  }

  if (!isLoaded || !user) {
    return <FullPageLoader />;
  }

  if (cartItems.length === 0) {
    return (
        <SimpleLayout>
            <div className="container mx-auto text-center py-16">
                <h1 className="text-2xl font-bold">Your cart is empty</h1>
                <p className="text-muted-foreground">Add some products to proceed to checkout.</p>
                <Button onClick={() => router.push('/')} className="mt-4">Go Shopping</Button>
            </div>
        </SimpleLayout>
    )
  }

  return (
    <SimpleLayout>
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-headline font-bold mb-8 text-center">Checkout</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-2 flex flex-col gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Shipping Address</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="fullName" render={({ field }) => (
                        <FormItem className="md:col-span-2">
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem className="md:col-span-2">
                        <FormLabel>Address</FormLabel>
                        <FormControl><Input placeholder="123 Main St, Apt 4B" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl><Input placeholder="Anytown" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="state" render={({ field }) => (
                        <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl><Input placeholder="CA" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="zip" render={({ field }) => (
                        <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl><Input placeholder="1234" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl><Input placeholder="01xxxxxxxxx" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                    <CardTitle className="text-xl">Payment Method</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                        <FormItem>
                        <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 gap-4">
                            <Label htmlFor="cod" className="flex flex-col items-start gap-4 rounded-md border border-muted bg-popover p-4 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <RadioGroupItem value="cod" id="cod" />
                                    <Wallet className="h-6 w-6" />
                                    <div className="grid gap-1">
                                        <p className="font-semibold">Cash on Delivery</p>
                                        <p className="text-sm text-muted-foreground">Pay with cash upon delivery.</p>
                                    </div>
                                </div>
                            </Label>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1">
              <Card className="sticky top-24 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4 max-h-64 overflow-y-auto pr-2">
                        {cartItems.map(item => (
                            <div key={item.id} className="flex items-center gap-4">
                            <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                                <Image src={item.images[0]} alt={item.name} fill className="object-cover" />
                            </div>
                            <div className="flex-grow">
                                <p className="font-semibold leading-tight">{item.name}</p>
                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-semibold text-right">{settings.currencySymbol}{(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{settings.currencySymbol}{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shipping > 0 ? `${settings.currencySymbol}${shipping.toFixed(2)}` : "Free"}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{settings.currencySymbol}{total.toFixed(2)}</span>
                  </div>
                   <Button type="submit" size="lg" className="w-full mt-4 text-base font-bold" disabled={isProcessing}>
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin"/>
                                Placing Order...
                            </>
                        ) : (
                            <>
                                <Truck className="mr-2 h-5 w-5"/>
                                Place Order
                            </>
                        )}
                   </Button>
                </CardContent>
              </Card>
            </div>
          </form>
        </Form>
      </div>
    </SimpleLayout>
  );
}
