import type { Metadata } from "next";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { HeroSlider } from "@/components/storefront/hero-slider";
import { CategoryGrid } from "@/components/storefront/category-grid";
import { ProductRow } from "@/components/storefront/product-row";
import { FlashSaleRow } from "@/components/storefront/flash-sale-row";
import { CtaBanner } from "@/components/storefront/cta-banner";
import { getCategories, getBrands, getCollections, getProducts, getFeaturedProducts, getHotDeals, getNewArrivals, getTrending, getHeroSlides, getAllVariantData } from "@/lib/data/access";
import { fetchFlashSales } from "@/lib/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CLOTHING X — Premium Lifestyle Apparel | COD Across Bangladesh",
  description: "Shop premium menswear, womenswear, jerseys, sports apparel & luxury essentials. Cash on delivery (COD) across all 64 districts of Bangladesh. Authenticity guaranteed.",
  alternates: { canonical: "/" },
};
export default async function HomePage() {
  const [categories, brands, collections, products, slides, flashSales, variantData] = await Promise.all([
    getCategories(), getBrands(), getCollections(), getProducts(), getHeroSlides(), fetchFlashSales().catch(() => []), getAllVariantData()
  ]);
  const featured = await getFeaturedProducts();
  const hotDeals = await getHotDeals();
  const newArrivals = await getNewArrivals(8);
  const trending = await getTrending(8);

  // Build product map for flash sale
  const productMap: Record<string, { name: string; image: string; base_price: number }> = {};
  for (const p of products) {
    productMap[p.id] = { name: p.name, image: p.images?.[0] ?? "", base_price: p.base_price };
  }

  // Build brand map for product cards (brand_id → brand name)
  const brandMap: Record<string, string> = {};
  for (const b of brands) brandMap[b.id] = b.name;

  return (
    <>
    <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": "https://clothingx.com/#organization",
                name: "CLOTHING X",
                url: "https://clothingx.com",
                description: "Premium lifestyle apparel store in Bangladesh with COD nationwide.",
                sameAs: [
                  "https://facebook.com/clothingx",
                  "https://instagram.com/clothingx",
                ],
              },
              {
                "@type": "WebSite",
                "@id": "https://clothingx.com/#website",
                url: "https://clothingx.com",
                name: "CLOTHING X",
                publisher: { "@id": "https://clothingx.com/#organization" },
                potentialAction: {
                  "@type": "SearchAction",
                  target: "https://clothingx.com/shop?q={search_term_string}",
                  "query-input": "required name=search_term_string",
                },
              },
              {
                "@type": "Store",
                "@id": "https://clothingx.com/#store",
                name: "CLOTHING X",
                image: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80",
                priceRange: "$$",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: "Dhaka",
                  addressRegion: "Dhaka",
                  addressCountry: "BD",
                },
              },
            ],
          }),
        }}
      />
    <StorefrontShell>
      {/* Organization + WebSite structured data for Google */}
      
      <HeroSlider slides={slides} />
      <CategoryGrid categories={categories} />
      <FlashSaleRow sales={flashSales} productMap={productMap} allProducts={products} optionsMap={variantData.optionsMap} variantsMap={variantData.variantsMap} brandMap={brandMap} />
      <ProductRow title="Featured Products" href="/shop?filter=featured" products={featured} optionsMap={variantData.optionsMap} variantsMap={variantData.variantsMap} brandMap={brandMap} />
      <ProductRow title="Hot Deals" href="/shop?filter=hot-deals" products={hotDeals} optionsMap={variantData.optionsMap} variantsMap={variantData.variantsMap} brandMap={brandMap} />
      <ProductRow title="New Arrivals" href="/shop?sort=newest" products={newArrivals} optionsMap={variantData.optionsMap} variantsMap={variantData.variantsMap} brandMap={brandMap} />
      <ProductRow title="Trending Now" href="/shop?sort=trending" products={trending} optionsMap={variantData.optionsMap} variantsMap={variantData.variantsMap} brandMap={brandMap} />
      <CtaBanner title="Members get more." subtitle="Sign up for early access to drops, agent pricing and exclusive collections. Cash on delivery across all 64 districts." cta="Create Account" href="/account" image="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80" />
    </StorefrontShell></>
  );
}
