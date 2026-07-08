"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, Clock, ArrowRight, Flame } from "lucide-react";
import { ProductCard } from "./product-card";
import { MaxWidthWrapper } from "@/components/shared/max-width-wrapper";
import {
  Carousel, CarouselContent, CarouselItem,
} from "@/components/ui/carousel";
import type { FlashSale } from "@/lib/actions";
import type { Product } from "@/lib/data/types";
import type { ProductOption, ProductVariant } from "@/lib/data/variant-types";

interface Props {
  sales: FlashSale[];
  productMap: Record<string, { name: string; image: string; base_price: number }>;
  allProducts: Product[];
  optionsMap?: Record<string, ProductOption[]>;
  variantsMap?: Record<string, ProductVariant[]>;
  brandMap?: Record<string, string>;
}

function calc(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, expired: true };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
    expired: false,
  };
}
function pad(n: number) { return String(n).padStart(2, "0"); }

function CountdownTimer({ endDate }: { endDate: string }) {
  // Always call hooks in the same order — never conditionally
  const [remaining, setRemaining] = useState({ days: 0, hours: 0, mins: 0, secs: 0, expired: false });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setRemaining(calc(endDate));
    const id = setInterval(() => setRemaining(calc(endDate)), 1000);
    return () => clearInterval(id);
  }, [endDate]);

  // Render static "00:00:00" until mounted to avoid hydration mismatch
  const d = mounted ? remaining : { days: 0, hours: 0, mins: 0, secs: 0, expired: false };
  if (d.expired) return null;

  return (
    <div className="flex items-center gap-1.5 font-mono text-sm font-bold">
      {d.days > 0 && (
        <span className="rounded-md bg-foreground px-2 py-1 text-background text-xs">{pad(d.days)}d</span>
      )}
      <span className="rounded-md bg-foreground px-2 py-1 text-background text-xs">{pad(d.hours)}</span>
      <span className="text-foreground/50">:</span>
      <span className="rounded-md bg-foreground px-2 py-1 text-background text-xs">{pad(d.mins)}</span>
      <span className="text-foreground/50">:</span>
      <span className="rounded-md bg-primary px-2 py-1 text-primary-foreground text-xs">{pad(d.secs)}</span>
    </div>
  );
}

export function FlashSaleRow({ sales, productMap, allProducts, optionsMap = {}, variantsMap = {}, brandMap = {} }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Find active sale — only on client after mount to avoid hydration mismatch
  const activeSale = mounted ? sales.find((s) => {
    const start = new Date(s.starts_at).getTime();
    const end = new Date(s.ends_at).getTime();
    const now = Date.now();
    return s.is_active && now >= start && now <= end;
  }) : undefined;

  if (!activeSale) return null;

  // Get products in this sale
  const saleProducts = activeSale.product_ids
    .map((id) => allProducts.find((p) => p.id === id))
    .filter(Boolean) as Product[];

  if (saleProducts.length === 0) return null;

  // Apply discount to each product
  const discountedProducts = saleProducts.map((p) => ({
    ...p,
    compare_price: p.base_price,
    base_price: Math.round(p.base_price * (1 - activeSale.discount_percentage / 100)),
  }));

  return (
    <section className="py-8 md:py-12">
      <MaxWidthWrapper>
        {/* Header card with gradient background */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent p-5 md:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              {/* Flame icon */}
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/20">
                <Flame className="h-7 w-7 text-primary" />
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  -{activeSale.discount_percentage}%
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="break-words font-heading text-xl font-bold tracking-tight md:text-2xl">
                  {activeSale.title}
                </h2>
                {activeSale.description && (
                  <p className="mt-0.5 break-words text-sm text-muted-foreground">{activeSale.description}</p>
                )}
              </div>
            </div>

            {/* Countdown + shop button */}
            <div className="flex shrink-0 flex-col gap-2 sm:items-end">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Ends in</span>
              </div>
              <div className="flex items-center gap-3">
                <CountdownTimer endDate={activeSale.ends_at} />
                <Link
                  href="/shop?filter=flash-sale"
                  className="group flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground transition hover:bg-primary/90"
                >
                  Shop All
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>

      {/* Desktop: grid */}
      <div className="hidden md:block">
        <MaxWidthWrapper>
          <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:grid-cols-4">
            {discountedProducts.slice(0, 4).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} options={optionsMap[p.id]} variants={variantsMap[p.id]} brandName={brandMap[p.brand_id ?? ""]} />
            ))}
          </div>
        </MaxWidthWrapper>
      </div>

      {/* Mobile: carousel */}
      <div className="px-4 md:hidden">
        <Carousel opts={{ align: "start", loop: false, dragFree: true }} className="w-full">
          <CarouselContent className="-ml-3">
            {discountedProducts.map((p, i) => (
              <CarouselItem key={p.id} className="basis-[60%] pl-3">
                <ProductCard product={p} index={i} options={optionsMap[p.id]} variants={variantsMap[p.id]} brandName={brandMap[p.brand_id ?? ""]} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
