
import type { StaticImageData } from "next/image";

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  stock: number;
  rating: number;
  category: string;
}

export interface Banner {
  id: string;
  title: string;
  image: string;
  dataAiHint: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type OrderStatus = 'Pending' | 'Packed' | 'Shipped' | 'Delivered' | 'Canceled';

export interface ShippingAddress {
  id?: string;
  fullName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  shippingFee: number;
  status: OrderStatus;
  date: string;
  shippingAddress: ShippingAddress;
  userEmail?: string;
}
