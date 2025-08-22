
'use client';

import { AddProductForm } from "./AddProductForm";
import { ProductList } from "./ProductList";
  
export default function AdminProductsPage() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1">
                <AddProductForm />
            </div>
            <div className="lg:col-span-2">
                <ProductList />
            </div>
        </div>
    )
}
