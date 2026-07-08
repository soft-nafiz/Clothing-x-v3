"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, User, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/stores/cart-store";
import { useEffect, useState } from "react";

const ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "All Products", href: "/shop", icon: Package },
  { label: "Cart", action: "cart" as const, icon: ShoppingCart },
  { label: "Account", href: "/account", icon: User },
];

/** Fixed mobile bottom navigation dock — Instagram-style. */
export function BottomNav() {
  const pathname = usePathname();
  const { openCart, itemCount } = useCart();
  const count = itemCount();
  const [mounted, setMounted] = useState(false);
useEffect(() => { setMounted(true); }, []);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-md pb-safe md:hidden"
      aria-label="Bottom navigation"
    >
      <ul className="grid grid-cols-4">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            "href" in item
              ? item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href || "")
              : false;

          if (item.action === "cart") {
            return (
              <li key={item.label}>
                <button
                  onClick={openCart}
                  className="relative flex w-full flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <div className="relative">
                    <Icon className="h-5 w-5" />
                    {mounted && count > 0 && (
  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
    {count}
  </span>
)}
                  </div>
                  <span className="tracking-wide">{item.label}</span>
                </button>
              </li>
            );
          }

          return (
            <li key={item.label}>
              <Link
                href={item.href!}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="tracking-wide">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
