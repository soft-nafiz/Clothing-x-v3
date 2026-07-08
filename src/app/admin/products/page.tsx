import type { Metadata } from "next";
import { getCachedNavData } from "@/lib/data/access";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProductsManager } from "@/components/admin/products-manager";

export const metadata: Metadata = { title: "Admin · Products" };

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const { products, categories, brands, collections } = await getCachedNavData();

  // Fetch variant counts per product from the product_variants table
  const admin = createAdminClient();
  const { data: variantRows } = await (admin as any)
    .from("product_variants")
    .select("product_id");

  // Build a map of product_id → variant count
  const variantCounts: Record<string, number> = {};
  if (variantRows && Array.isArray(variantRows)) {
    for (const row of variantRows) {
      const pid = row.product_id;
      if (pid) variantCounts[pid] = (variantCounts[pid] ?? 0) + 1;
    }
  }

  return (
    <ProductsManager
      products={products}
      categories={categories}
      brands={brands}
      collections={collections}
      variantCounts={variantCounts}
    />
  );
}
