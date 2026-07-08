"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MaxWidthWrapper } from "@/components/shared/max-width-wrapper";

interface Props {
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  image?: string;
}

/** Sleek marketing banner leading to global shop. */
export function CtaBanner({ title, subtitle, cta, href, image }: Props) {
  return (
    <section className="py-16 md:py-24">
      <MaxWidthWrapper>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl bg-card"
        >
          {image && (
            <div className="absolute inset-0 opacity-25">
              { }
              <img
                src={image}
                alt=""
                className="h-full w-full object-cover"
                aria-hidden
              />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
          <div className="relative px-6 py-12 md:px-16 md:py-20">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Members get more
            </p>
            <h2 className="max-w-2xl font-serif text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
              {title}
            </h2>
            <p className="mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
              {subtitle}
            </p>
            <div className="mt-7">
              <Button asChild size="lg" className="gap-2">
                <Link href={href}>
                  {cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </MaxWidthWrapper>
    </section>
  );
}
