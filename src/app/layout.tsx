
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { Providers } from '@/components/providers';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const revalidate = 3600;

// This function dynamically generates metadata for the page.
export async function generateMetadata(): Promise<Metadata> {
  let shopName = 'ShopSwift'; // Default title
  try {
    const settingsDoc = await getDoc(doc(db, 'settings', 'store_config'));
    if (settingsDoc.exists()) {
      shopName = settingsDoc.data().shopName || shopName;
    }
  } catch (error) {
    console.error("Failed to fetch shop name for metadata", error);
  }

  return {
    title: {
      default: shopName,
      template: `%s | ${shopName}`
    },
    description: 'A modern responsive E-commerce web and mobile app.',
  };
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Lexend:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn(
        "font-body antialiased h-full"
      )} suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
