"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { ProductCard } from "./product-card";
import { MaxWidthWrapper } from "@/components/shared/max-width-wrapper";
import {
  Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext,
} from "@/components/ui/carousel";
import type { Product } from "@/lib/data/types";
import type { ProductOption, ProductVariant } from "@/lib/data/variant-types";

interface Props {
  title: string;
  href?: string;
  products: Product[];
  optionsMap?: Record<string, ProductOption[]>;
  variantsMap?: Record<string, ProductVariant[]>;
  brandMap?: Record<string, string>;
}

/** Product row — grid on desktop, swipeable carousel on mobile. */
export function ProductRow({ title, href, products, optionsMap = {}, variantsMap = {}, brandMap = {} }: Props) {
  if (!products.length) return null;

  return (
    <section className="py-12 md:py-16">
      <MaxWidthWrapper>
        <div className="mb-6 flex items-end justify-between">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="font-serif text-2xl font-semibold tracking-tight md:text-3xl"
          >
            {title}
          </motion.h2>
          {href && (
            <Link
              href={href}
              className="group flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-primary"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>

        {/* Desktop: grid layout */}
        <div className="hidden grid-cols-3 gap-3 sm:gap-4 lg:grid-cols-4 md:grid">
          {products.slice(0, 8).map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              index={i}
              options={optionsMap[p.id]}
              variants={variantsMap[p.id]}
              brandName={brandMap[p.brand_id ?? ""]}
            />
          ))}
        </div>
      </MaxWidthWrapper>

      {/* Mobile: swipeable carousel */}
      <div className="px-4 md:hidden">
        <Carousel
          opts={{ align: "start", loop: false, dragFree: true }}
          className="w-full"
        >
          <CarouselContent className="-ml-3">
            {products.map((p, i) => (
              <CarouselItem key={p.id} className="basis-[60%] pl-3">
                <ProductCard
                  product={p}
                  index={i}
                  options={optionsMap[p.id]}
                  variants={variantsMap[p.id]}
                  brandName={brandMap[p.brand_id ?? ""]}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
