"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown, Menu, ShoppingBag, User, X, Info,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MaxWidthWrapper } from "@/components/shared/max-width-wrapper";
import { SearchDropdown } from "@/components/layout/search-dropdown";
import { GoogleTranslate } from "@/components/layout/google-translate";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useCart } from "@/lib/stores/cart-store";
import { cn } from "@/lib/utils";
import type { Category, Brand, Collection, Product } from "@/lib/data/types";




interface Props {
  categories: Category[];
  brands: Brand[];
  collections: Collection[];
  products: Product[];
}

export function Navbar({ categories, brands, collections, products }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { openCart, itemCount } = useCart();
  const [mounted, setMounted] = useState(false);
useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [pathname]);

  const count = itemCount();

  return (
    <>
      {/* ============ TOP BAR ============ */}
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md transition-all",
          scrolled && "bg-background/95"
        )}
      >
        <MaxWidthWrapper>
          {/* Mobile: flex justify-between, no account/cart icons */}
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="shrink-0" aria-label="CLOTHING X home">
              <img src="/logo-dark.png" alt="CLOTHING X" className="h-7 w-auto dark:block dark:inline hidden" />
              <img src="/logo-light.png" alt="CLOTHING X" className="h-7 w-auto block dark:hidden" />
            </Link>

            {/* Search — desktop only, centered */}
            <div className="hidden flex-1 md:block">
              <SearchDropdown products={products} />
            </div>

            {/* Desktop nav links */}
            <nav className="hidden items-center gap-5 lg:flex">
              <Link
                href="/shop"
                className="text-sm font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground transition"
              >
                All Products
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground transition"
              >
                About
              </Link>

              {/* Brands dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 text-sm font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground transition">
                    Brands <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {brands.map((b) => (
                    <DropdownMenuItem key={b.id} asChild>
                      <Link href={`/brands/${b.slug}`} className="cursor-pointer">{b.name}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Collections dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 text-sm font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground transition">
                    Collections <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  {collections.map((c) => (
                    <DropdownMenuItem key={c.id} asChild>
                      <Link href={`/collections/${c.slug}`} className="cursor-pointer">{c.name}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            {/* Right icons — desktop only: cart + account */}
            <div className="hidden items-center gap-1 md:flex">
              <Button
  onClick={openCart}
  variant="ghost"
  size="icon"
  className="relative"
  aria-label={`Cart with ${mounted ? count : 0} items`}
>
  <ShoppingBag className="h-5 w-5" />
  {mounted && count > 0 && (
    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
      {count}
    </span>
  )}
</Button>
              <GoogleTranslate />
              <ThemeToggle />
              <Button asChild variant="ghost" size="icon" aria-label="Account">
                <Link href="/account"><User className="h-5 w-5" /></Link>
              </Button>
            </div>

            {/* Mobile: translate + theme + hamburger */}
            <div className="flex items-center gap-1 md:hidden">
              <GoogleTranslate />
              <ThemeToggle />
              <Button
                onClick={() => setMobileOpen(true)}
                variant="ghost"
                size="icon"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Mobile search row */}
          <div className="pb-3 md:hidden">
            <SearchDropdown products={products} placeholder="Search products…" />
          </div>
        </MaxWidthWrapper>
      </header>

      {/* ============ SUB-NAV (categories strip) ============ */}
      <div className="sticky top-16 z-40 hidden border-b border-border bg-background/95 backdrop-blur md:block">
        <MaxWidthWrapper>
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {categories.map((cat) => {
  const active = pathname === `/categories/${cat.slug}`;
  return (
    <Link
      key={cat.slug}
      href={`/categories/${cat.slug}`}
      className={cn(
        "flex shrink-0 items-center gap-1 px-4 py-2.5 text-xs font-medium uppercase tracking-wider transition hover:text-primary",
        active ? "text-primary" : "text-muted-foreground"
      )}
    >
      {cat.name}
      <ChevronDown className="h-3 w-3 opacity-50" />
    </Link>
  );
})}
          </nav>
        </MaxWidthWrapper>
      </div>

      {/* ============ MOBILE SLIDE-OUT MENU ============ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[70] bg-background/80 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="fixed left-0 top-0 z-[80] flex h-[100dvh] w-full max-w-xs flex-col bg-background md:hidden"
              aria-label="Mobile menu"
            >
              {/* Header with padding */}
              <div className="flex items-center justify-between px-5 py-4">
                <img src="/logo-dark.png" alt="CLOTHING X" className="h-6 w-auto dark:block hidden" />
                <img src="/logo-light.png" alt="CLOTHING X" className="h-6 w-auto block dark:hidden" />
                <Button
                  onClick={() => setMobileOpen(false)}
                  variant="ghost"
                  size="icon"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Scrollable nav with proper padding */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {/* Primary nav links */}
                <div className="space-y-1 pb-4">
                  <Link
                    href="/"
                    className="block rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
                  >
                    Home
                  </Link>
                  <Link
                    href="/shop"
                    className="block rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
                  >
                    Shop
                  </Link>
                  <Link
                    href="/about"
                    className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
                  >
                    <Info className="h-4 w-4" />
                    About
                  </Link>
                  <Link
                    href="/contact"
                    className="block rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
                  >
                    Contact
                  </Link>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Categories
                  </p>
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/categories/${c.slug}`}
                      className="block rounded-md px-3 py-2.5 text-sm hover:bg-accent"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>

                <div className="border-t border-border pt-4">
                  <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Brands
                  </p>
                  {brands.map((b) => (
                    <Link
                      key={b.id}
                      href={`/brands/${b.slug}`}
                      className="block rounded-md px-3 py-2.5 text-sm hover:bg-accent"
                    >
                      {b.name}
                    </Link>
                  ))}
                </div>

                <div className="border-t border-border pt-4">
                  <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Collections
                  </p>
                  {collections.map((c) => (
                    <Link
                      key={c.id}
                      href={`/collections/${c.slug}`}
                      className="block rounded-md px-3 py-2.5 text-sm hover:bg-accent"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>

                <div className="border-t border-border pt-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href="/account">Account</Link>
                    </Button>
                    <Button asChild size="sm" onClick={() => setMobileOpen(false)}>
                      <span onClick={openCart} className="flex w-full items-center justify-center gap-2">
                        <ShoppingBag className="h-4 w-4" />
                        Cart ({count})
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
