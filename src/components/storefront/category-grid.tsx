"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MaxWidthWrapper } from "@/components/shared/max-width-wrapper";
import { ArrowRight, Shirt, Trophy, Dumbbell, User, Users, Gamepad2, Palette, Layers, Sparkles, Tag } from "lucide-react";
import {
  Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { getIconByName } from "@/components/admin/taxonomy-manager";
import type { Category } from "@/lib/data/types";

interface Props {
  categories: Category[];
}

/** Category carousel — compact icon cards, auto-sliding on all devices. */
export function CategoryGrid({ categories }: Props) {
  const featured = categories.slice(0, 10);
  const [api, setApi] = useState<CarouselApi>();

  // Auto-slide every 4 seconds
  useEffect(() => {
    if (!api) return;
    const interval = setInterval(() => {
      api.scrollNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [api]);

  return (
    <section className="py-10 md:py-14">
      <MaxWidthWrapper>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Explore
            </p>
            <h2 className="font-serif text-2xl font-semibold tracking-tight md:text-3xl">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="group flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-primary"
          >
            All categories
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </MaxWidthWrapper>

      {/* Carousel — wrapped in max width */}
      <MaxWidthWrapper>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          setApi={setApi}
          className="w-full"
        >
          <CarouselContent className="-ml-2 sm:-ml-3">
            {featured.map((cat, i) => {
              const Icon = getIconByName(cat.icon);
              return (
                <CarouselItem
                  key={cat.id}
                  className="basis-[30%] pl-2 sm:basis-[20%] sm:pl-3 md:basis-[15%] lg:basis-[12%]"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <Link href={`/categories/${cat.slug}`} className="group flex flex-col items-center gap-2.5">
                      {/* Icon circle */}
                      <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-border bg-card p-4 transition-all group-hover:border-primary/40 group-hover:bg-primary/5 group-hover:shadow-lg group-hover:shadow-primary/5">
                        <Icon className="h-7 w-7 text-muted-foreground transition-colors group-hover:text-primary sm:h-8 sm:w-8 md:h-9 md:w-9" />
                      </div>
                      {/* Category name */}
                      <span className="line-clamp-1 text-center text-xs font-medium text-foreground transition-colors group-hover:text-primary sm:text-sm">
                        {cat.name}
                      </span>
                    </Link>
                  </motion.div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </MaxWidthWrapper>
    </section>
  );
}
