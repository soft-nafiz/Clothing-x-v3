/**
 * Unified data access layer.
 * Uses real Supabase database via the admin client.
 * Seeds products on first run if the table is empty.
 */
import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { seedProductsIfEmpty } from "./seed-db";
import { defaultDeliveryFee } from "./bangladesh";
import type {
  Category, Brand, Collection, Product, Agent, Promotion, Review, HeroSlide,
} from "./types";
import type { ProductOption, ProductVariant } from "./variant-types";

/* ------------------------------------------------------------------ */
/* Safe query wrapper                                                  */
/* ------------------------------------------------------------------ */
async function safe<T>(promise: Promise<{ data: T | null; error: unknown }>): Promise<T | null> {
  try {
    const { data, error } = await promise;
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* SEED (runs once if products table is empty)                        */
/* ------------------------------------------------------------------ */
let seedRan = false;
export async function ensureSeeded() {
  if (seedRan) return;
  seedRan = true;
  try {
    await seedProductsIfEmpty();
  } catch {
    // ignore seed errors
  }
}

/* ------------------------------------------------------------------ */
/* CATEGORIES                                                          */
/* ------------------------------------------------------------------ */
export async function getCategories(): Promise<Category[]> {
  await ensureSeeded();
  const supabase = createAdminClient();
  const rows = await safe(supabase.from("categories").select("*").order("name"));
  return (rows ?? []) as unknown as Category[];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  await ensureSeeded();
  const supabase = createAdminClient();
  const row = await safe(supabase.from("categories").select("*").eq("slug", slug).single());
  return row as unknown as Category | null;
}

/* ------------------------------------------------------------------ */
/* BRANDS                                                              */
/* ------------------------------------------------------------------ */
export async function getBrands(): Promise<Brand[]> {
  await ensureSeeded();
  const supabase = createAdminClient();
  const rows = await safe(supabase.from("brands").select("*").order("name"));
  return (rows ?? []) as unknown as Brand[];
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  await ensureSeeded();
  const supabase = createAdminClient();
  const row = await safe(supabase.from("brands").select("*").eq("slug", slug).single());
  return row as unknown as Brand | null;
}

/* ------------------------------------------------------------------ */
/* COLLECTIONS                                                         */
/* ------------------------------------------------------------------ */
export async function getCollections(): Promise<Collection[]> {
  await ensureSeeded();
  const supabase = createAdminClient();
  const rows = await safe(supabase.from("collections").select("*").order("name"));
  return (rows ?? []) as unknown as Collection[];
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  await ensureSeeded();
  const supabase = createAdminClient();
  const row = await safe(supabase.from("collections").select("*").eq("slug", slug).single());
  return row as unknown as Collection | null;
}

/* ------------------------------------------------------------------ */
/* PRODUCTS                                                            */
/* ------------------------------------------------------------------ */
export async function getProducts(): Promise<Product[]> {
  await ensureSeeded();
  const supabase = createAdminClient();
  const rows = await safe(
    supabase.from("products").select("*").order("created_at", { ascending: false })
  );
  return (rows ?? []) as unknown as Product[];
}

export async function getProductById(id: string): Promise<Product | null> {
  await ensureSeeded();
  const supabase = createAdminClient();
  const row = await safe(supabase.from("products").select("*").eq("id", id).single());
  return row as unknown as Product | null;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const all = await getProducts();
  return all.filter((p) => p.is_featured);
}

export async function getHotDeals(): Promise<Product[]> {
  const all = await getProducts();
  return all.filter((p) => p.is_hot_deal);
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  const all = await getProducts();
  return [...all]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

export async function getTrending(limit = 8): Promise<Product[]> {
  const all = await getProducts();
  return [...all].sort((a, b) => b.sales_count - a.sales_count).slice(0, limit);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const all = await getProducts();
  return all
    .filter((p) => p.id !== product.id && (
      p.category_id === product.category_id ||
      p.brand_id === product.brand_id ||
      p.collection_id === product.collection_id
    ))
    .slice(0, limit);
}

/* ------------------------------------------------------------------ */
/* AGENTS + PROMOTIONS                                                 */
/* ------------------------------------------------------------------ */
export async function getAgents(): Promise<Agent[]> {
  const supabase = createAdminClient();
  const rows = await safe(supabase.from("agents").select("*").order("name"));
  return (rows ?? []) as unknown as Agent[];
}

export async function getAgentByCode(code: string): Promise<Agent | null> {
  const supabase = createAdminClient();
  const row = await safe(supabase.from("agents").select("*").eq("agent_code", code).single());
  return row as unknown as Agent | null;
}

export async function getPromotions(): Promise<Promotion[]> {
  const supabase = createAdminClient();
  const rows = await safe(supabase.from("promotions").select("*").eq("active", true));
  return (rows ?? []) as unknown as Promotion[];
}

export async function resolveCoupon(code: string): Promise<{
  discount: number;
  agent: Agent | null;
} | null> {
  if (!code) return null;
  const upper = code.trim().toUpperCase();
  const agent = await getAgentByCode(upper);
  if (agent) return { discount: agent.commission_percentage, agent };
  const promos = await getPromotions();
  const promo = promos.find((p) => p.code === upper && p.active);
  if (promo) return { discount: promo.discount_percentage, agent: null };
  return null;
}

/* ------------------------------------------------------------------ */
/* REVIEWS                                                             */
/* ------------------------------------------------------------------ */
export async function getReviews(productId: string): Promise<Review[]> {
  const supabase = createAdminClient();
  const rows = await safe(
    supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
  );
  return (rows ?? []) as unknown as Review[];
}

/* ------------------------------------------------------------------ */
/* DELIVERY FEES                                                       */
/* ------------------------------------------------------------------ */
export async function getDeliveryFee(division: string, district: string): Promise<number> {
  const supabase = createAdminClient();
  const row = await safe(
    supabase
      .from("delivery_fees")
      .select("fee")
      .eq("division", division)
      .eq("district", district)
      .single()
  );
  if (row && typeof (row as { fee?: number }).fee === "number") {
    return (row as { fee: number }).fee;
  }
  return defaultDeliveryFee(division, district);
}

/* ------------------------------------------------------------------ */
/* HERO SLIDES (CMS)                                                   */
/* ------------------------------------------------------------------ */
export async function getHeroSlides(): Promise<HeroSlide[]> {
  const supabase = createAdminClient();
  // Try cms_full first (where the CMS admin saves)
  const cmsRow = await safe(
    supabase.from("site_content").select("value").eq("key", "cms_full").single()
  );
  if (cmsRow) {
    const val = (cmsRow as any).value;
    if (val?.heroSlides && Array.isArray(val.heroSlides) && val.heroSlides.length > 0) {
      return val.heroSlides as HeroSlide[];
    }
  }
  // Fallback to hero_slides key (old format)
  const row = await safe(
    supabase.from("site_content").select("value").eq("key", "hero_slides").single()
  );
  if (row) {
    const val = (row as { value?: unknown }).value;
    if (Array.isArray(val)) return val as HeroSlide[];
  }
  return [];
}

/* ------------------------------------------------------------------ */
/* NAV DATA — NO CACHE (always fetch fresh from database)              */
/* ------------------------------------------------------------------ */
export async function getCachedNavData() {
  const supabase = createAdminClient();

  // Ensure products are seeded before fetching
  await ensureSeeded();

  const [catRows, brandRows, colRows, prodRows] = await Promise.all([
    safe(supabase.from("categories").select("*").order("name")),
    safe(supabase.from("brands").select("*").order("name")),
    safe(supabase.from("collections").select("*").order("name")),
    safe(supabase.from("products").select("*").order("created_at", { ascending: false })),
  ]);

  return {
    categories: (catRows ?? []) as Category[],
    brands: (brandRows ?? []) as Brand[],
    collections: (colRows ?? []) as Collection[],
    products: (prodRows ?? []) as unknown as Product[],
  };
}

/* ------------------------------------------------------------------ */
/* ALL VARIANT DATA (batch fetch — one query for options, one for variants) */
/* ------------------------------------------------------------------ */
export async function getAllVariantData(): Promise<{
  optionsMap: Record<string, ProductOption[]>;
  variantsMap: Record<string, ProductVariant[]>;
}> {
  const supabase = createAdminClient();
  const [optRows, varRows] = await Promise.all([
    safe(supabase.from("product_options").select("*")),
    safe(supabase.from("product_variants").select("*")),
  ]);

  const optionsMap: Record<string, ProductOption[]> = {};
  const variantsMap: Record<string, ProductVariant[]> = {};

  if (optRows && Array.isArray(optRows)) {
    for (const row of optRows as any[]) {
      if (!optionsMap[row.product_id]) optionsMap[row.product_id] = [];
      optionsMap[row.product_id].push({
        id: row.id,
        product_id: row.product_id,
        name: row.name,
        values: row.values ?? [],
        created_at: row.created_at,
      });
    }
  }

  if (varRows && Array.isArray(varRows)) {
    for (const row of varRows as any[]) {
      if (!variantsMap[row.product_id]) variantsMap[row.product_id] = [];
      variantsMap[row.product_id].push({
        id: row.id,
        product_id: row.product_id,
        combination: row.combination ?? {},
        price_override: row.price_override ?? null,
        stock: row.stock ?? 0,
        sku: row.sku ?? null,
        created_at: row.created_at,
      });
    }
  }

  return { optionsMap, variantsMap };
}