"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { getClientNavData } from "@/lib/data/client-access";
import type { Category, Brand, Collection, Product } from "@/lib/data/types";

/**
 * Client-side storefront shell for pages that are themselves client components
 * (cart, checkout). Fetches nav data via the browser Supabase client.
 */
export function StorefrontShellClient({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<{
    categories: Category[];
    brands: Brand[];
    collections: Collection[];
    products: Product[];
  } | null>(null);

  useEffect(() => {
    getClientNavData().then((d) => {
       
      setData(d);
    });
  }, []);

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="h-16" />
        <main className="flex-1" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AnnouncementBar />
      <Navbar
        categories={data.categories}
        brands={data.brands}
        collections={data.collections}
        products={data.products}
      />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer
        categories={data.categories}
        brands={data.brands}
        collections={data.collections}
      />
      <CartDrawer />
      <BottomNav />
    </div>
  );
}
