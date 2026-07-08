import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { FloatingChat } from "@/components/layout/floating-chat";
import { getCachedNavData } from "@/lib/data/access";

/**
 * Shared storefront shell: announcement bar + navbar + cart drawer + footer + mobile dock.
 */
export async function StorefrontShell({ children }: { children: React.ReactNode }) {
  const { categories, brands, collections, products } = await getCachedNavData();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AnnouncementBar />
      <Navbar
        categories={categories}
        brands={brands}
        collections={collections}
        products={products}
      />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer
        categories={categories}
        brands={brands}
        collections={collections}
      />
      <CartDrawer />
      <BottomNav />
      <FloatingChat />
    </div>
  );
}
