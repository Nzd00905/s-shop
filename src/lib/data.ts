import type { Product, Banner, Order, CartItem, ShippingAddress } from './types';

export const products: Product[] = [
  { id: '1', name: 'Classic Leather Watch', price: 150.00, description: 'A timeless piece with a genuine leather strap and stainless steel case.', images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'], stock: 15, rating: 4.5, category: 'Accessories' },
  { id: '2', name: 'Minimalist Desk Lamp', price: 75.50, description: 'Sleek and modern desk lamp with adjustable brightness.', images: ['https://placehold.co/600x600.png'], stock: 30, rating: 4.8, category: 'Home Goods' },
  { id: '3', name: 'Wireless Noise-Cancelling Headphones', price: 250.00, description: 'Immerse yourself in sound with these high-fidelity headphones.', images: ['https://placehold.co/600x600.png'], stock: 10, rating: 4.9, category: 'Electronics' },
  { id: '4', name: 'Gourmet Coffee Blend', price: 22.00, description: 'A rich and aromatic blend of the finest Arabica beans.', images: ['https://placehold.co/600x600.png'], stock: 50, rating: 4.7, category: 'Groceries' },
  { id: '5', name: 'Organic Cotton T-Shirt', price: 30.00, description: 'Soft, breathable, and ethically made.', images: ['https://placehold.co/600x600.png'], stock: 100, rating: 4.6, category: 'Apparel' },
  { id: '6', name: 'Handcrafted Ceramic Mug', price: 25.00, description: 'Each mug is unique, perfect for your morning coffee.', images: ['https://placehold.co/600x600.png'], stock: 40, rating: 4.9, category: 'Home Goods' },
  { id: '7', name: 'Smart Fitness Tracker', price: 120.00, description: 'Track your activity, sleep, and heart rate with this smart wristband.', images: ['https://placehold.co/600x600.png'], stock: 25, rating: 4.4, category: 'Electronics' },
  { id: '8', name: 'The Art of Minimalist Living', price: 18.99, description: 'A book on decluttering your life and finding joy in simplicity.', images: ['https://placehold.co/600x600.png'], stock: 60, rating: 4.8, category: 'Books' },
];
