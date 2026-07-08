import type { Metadata } from "next";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { ShopView } from "@/components/storefront/shop-view";
import { MaxWidthWrapper } from "@/components/shared/max-width-wrapper";
import { getCachedNavData, getAllVariantData } from "@/lib/data/access";
import { fetchFlashSales } from "@/lib/actions";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse the full CLOTHING X catalogue. Filter by category, brand, and price.",
};

export const dynamic = "force-dynamic";

interface SearchParams {
  q?: string;
  filter?: string;
  sort?: string;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const [{ categories, brands, products }, variantData] = await Promise.all([
    getCachedNavData(),
    getAllVariantData(),
  ]);

  // Build brand map (brand_id → brand name)
  const brandMap: Record<string, string> = {};
  for (const b of brands) brandMap[b.id] = b.name;

  // Fetch active flash sales to get product IDs
  const flashSales = await fetchFlashSales().catch(() => []);
  const now = Date.now();
  const flashSaleProductIds = new Set<string>();
  for (const s of flashSales) {
    const start = new Date(s.starts_at).getTime();
    const end = new Date(s.ends_at).getTime();
    if (s.is_active && now >= start && now <= end) {
      s.product_ids.forEach((id) => flashSaleProductIds.add(id));
    }
  }

  let list = products;
  let title = "All Products";
  let subtitle = "Browse the full catalogue. Filter, sort, and find your next essential.";

  if (sp.q) {
    const q = sp.q.toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(q));
    title = `Search: ${sp.q}`;
    subtitle = `${list.length} result${list.length !== 1 ? "s" : ""} found.`;
  } else if (sp.filter === "featured") {
    list = list.filter((p) => p.is_featured);
    title = "Featured Products";
    subtitle = "Handpicked favourites from our latest drops.";
  } else if (sp.filter === "hot-deals") {
    list = list.filter((p) => p.is_hot_deal);
    title = "Hot Deals";
    subtitle = "Limited-time discounts on premium pieces.";
  } else if (sp.filter === "flash-sale") {
    list = list.filter((p) => flashSaleProductIds.has(p.id));
    title = "Flash Sale";
    subtitle = "Time-limited deals. Hurry before they're gone!";
  }

  return (
    <StorefrontShell>
      <MaxWidthWrapper className="py-8 md:py-12">
        <ShopView
          products={list}
          categories={categories}
          brands={brands}
          title={title}
          subtitle={subtitle}
          flashSaleProductIds={Array.from(flashSaleProductIds)}
          optionsMap={variantData.optionsMap}
          variantsMap={variantData.variantsMap}
          brandMap={brandMap}
        />
      </MaxWidthWrapper>
    </StorefrontShell>
  );
}
