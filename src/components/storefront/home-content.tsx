"use client";

import { useCMS } from "@/lib/hooks/use-cms";
import { HeroSlider } from "@/components/storefront/hero-slider";
import { CategoryGrid } from "@/components/storefront/category-grid";
import { ProductRow } from "@/components/storefront/product-row";
import { CtaBanner } from "@/components/storefront/cta-banner";
import type { Category, Product } from "@/lib/data/types";

interface Props {
  categories: Category[];
  featured: Product[];
  hotDeals: Product[];
  newArrivals: Product[];
  trending: Product[];
}

/** Client wrapper that renders home page sections with CMS-driven content */
export function HomeContent({
  categories, featured, hotDeals, newArrivals, trending,
}: Props) {
  const cms = useCMS();

  return (
    <>
      <HeroSlider slides={cms.heroSlides} />

      <CategoryGrid categories={categories} />

      <ProductRow
        title={cms.homeFeaturedTitle}
        href="/shop?filter=featured"
        products={featured}
      />

      <ProductRow
        title={cms.homeHotDealsTitle}
        href="/shop?filter=hot-deals"
        products={hotDeals}
      />

      <ProductRow
        title={cms.homeNewArrivalsTitle}
        href="/shop?sort=newest"
        products={newArrivals}
      />

      <ProductRow
        title={cms.homeTrendingTitle}
        href="/shop?sort=trending"
        products={trending}
      />

      <CtaBanner
        title={cms.ctaTitle}
        subtitle={cms.ctaSubtitle}
        cta={cms.ctaButtonText}
        href="/account"
        image={cms.ctaImage}
      />
    </>
  );
}
