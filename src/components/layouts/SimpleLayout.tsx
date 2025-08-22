
'use client';

import type { ReactNode } from "react";
import { Header } from "@/components/Header";

export function SimpleLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}
