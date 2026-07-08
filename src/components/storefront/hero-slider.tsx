"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "@/lib/data/types";

interface Props {
  slides: HeroSlide[];
}

/** Full-bleed hero slider with left-aligned gradient overlay + mobile stack. */
export function HeroSlider({ slides }: Props) {
  const [index, setIndex] = useState(0);

  const next = useCallback(
    () => setIndex((i) => (i + 1) % slides.length),
    [slides.length]
  );
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(next, 6500);
    return () => clearInterval(id);
  }, [next, slides.length]);

  if (!slides.length) return null;
  const slide = slides[index];

  return (
    <section className="relative w-full overflow-hidden bg-background">
      {/* DESKTOP: full-bleed slider with overlay */}
      <div className="relative hidden h-[70vh] min-h-[480px] w-full md:block">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            { }
            <img
              src={slide.image}
              alt={slide.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Text overlay — constrained to max-w-7xl */}
        <div className="relative z-10 flex h-full items-center">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                >
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                    New Drop
                  </p>
                  <h1 className="font-serif text-5xl font-semibold leading-[1.05] tracking-tight text-foreground lg:text-7xl">
                    {slide.title}
                  </h1>
                  <p className="mt-4 max-w-md text-base text-foreground/80 lg:text-lg">
                    {slide.subtitle}
                  </p>
                  <div className="mt-7">
                    <Button asChild size="lg" className="gap-2">
                      <Link href={slide.href}>
                        {slide.cta}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Arrows */}
        {slides.length > 1 && (
          <>
            <Button
              onClick={prev}
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border-border bg-background/50 backdrop-blur hover:bg-background"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              onClick={next}
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border-border bg-background/50 backdrop-blur hover:bg-background"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === index ? "w-8 bg-primary" : "w-1.5 bg-foreground/40"
                  )}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* MOBILE: stacked — text on top, image below */}
      <div className="md:hidden">
        <div className="mx-auto w-full max-w-7xl px-4 pt-8 pb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">
                New Drop
              </p>
              <h1 className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight">
                {slide.title}
              </h1>
              <p className="mt-3 text-sm text-foreground/75">{slide.subtitle}</p>
              <div className="mt-4">
                <Button asChild size="sm" className="gap-2">
                  <Link href={slide.href}>
                    {slide.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative aspect-[16/11] w-full overflow-hidden bg-muted">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              { }
              <img
                src={slide.image}
                alt={slide.title}
                className="h-full w-full object-cover"
              />
            </motion.div>
          </AnimatePresence>

          {slides.length > 1 && (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === index ? "w-6 bg-primary" : "w-1.5 bg-foreground/60"
                  )}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
