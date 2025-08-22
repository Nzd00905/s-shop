
'use client';

import { ThemeProvider } from '@/components/ThemeProvider';
import { UserProvider } from '@/hooks/use-user';
import { AllUsersProvider } from '@/hooks/use-all-users';
import { CartProvider } from '@/hooks/use-cart';
import { OrdersProvider } from '@/hooks/use-orders';
import { ProductsProvider } from '@/hooks/use-products.tsx';
import { WishlistProvider } from '@/hooks/use-wishlist';
import { CategoriesProvider } from '@/hooks/use-categories';
import { StoreSettingsProvider } from '@/hooks/use-store-settings';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <StoreSettingsProvider>
                <ProductsProvider>
                    <CategoriesProvider>
                        <UserProvider>
                            <OrdersProvider>
                                <AllUsersProvider>
                                    <CartProvider>
                                        <WishlistProvider>
                                            {children}
                                        </WishlistProvider>
                                    </CartProvider>
                                </AllUsersProvider>
                            </OrdersProvider>
                        </UserProvider>
                    </CategoriesProvider>
                </ProductsProvider>
            </StoreSettingsProvider>
        </ThemeProvider>
    )
}
