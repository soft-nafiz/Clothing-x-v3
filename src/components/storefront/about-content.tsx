"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Truck, Award, Leaf, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MaxWidthWrapper } from "@/components/shared/max-width-wrapper";
import { useCMS } from "@/lib/hooks/use-cms";
import Link from "next/link";

const VALUES = [
  {
    icon: Award,
    title: "Premium Quality",
    description: "Every piece is sourced from trusted manufacturers and inspected by hand. We refuse to ship anything we wouldn't wear ourselves.",
  },
  {
    icon: Truck,
    title: "Nationwide COD",
    description: "Cash on Delivery across all 64 districts of Bangladesh. Inspect before you pay — no online prepayment, no risk.",
  },
  {
    icon: ShieldCheck,
    title: "Trust First",
    description: "7-day refund portal, transparent order tracking, and a real human on the other end of every phone call.",
  },
  {
    icon: Leaf,
    title: "Deliberate Craft",
    description: "We design slowly. Each drop is curated, not mass-produced. White space, premium fabric, deliberate cuts.",
  },
];

const STATS = [
  { value: "18+", label: "Premium products" },
  { value: "64", label: "Districts served" },
  { value: "3", label: "Agent partners" },
  { value: "100%", label: "COD orders" },
];

export function AboutContent() {
  const cms = useCMS();

  return (
    <MaxWidthWrapper className="py-8 md:py-12">
      <header className="mb-12 border-b border-border pb-8">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary"
        >
          Our Story
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="font-heading text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl"
        >
          {cms.aboutTitle}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg"
        >
          {cms.aboutSubtitle}
        </motion.p>
      </header>

      {/* Stats */}
      <section className="mb-16 grid grid-cols-2 gap-4 md:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="text-center">
              <CardContent className="p-6">
                <p className="font-heading text-3xl font-semibold text-primary md:text-4xl">{s.value}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>

      {/* Mission */}
      <section className="mb-16 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">Our Mission</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            {cms.aboutMission}
          </p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted">
          { }
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80"
            alt="CLOTHING X storefront"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      {/* Values */}
      <section className="mb-16 border-t border-border pt-12">
        <h2 className="mb-8 font-heading text-2xl font-semibold tracking-tight md:text-3xl">
          What We Stand For
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {VALUES.map((v, i) => {
            const Icon = v.icon;
            return (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card>
                  <CardContent className="flex gap-4 p-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-semibold">{v.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{v.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border pt-12 text-center">
        <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
          Ready to explore?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Browse the full collection. COD nationwide.
        </p>
        <Button asChild size="lg" className="mt-6 gap-2 uppercase tracking-wider">
          <Link href="/shop">
            Shop Now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>
    </MaxWidthWrapper>
  );
}
