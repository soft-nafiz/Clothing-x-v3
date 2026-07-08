import type { Metadata } from "next";
import { getCachedNavData } from "@/lib/data/access";
import {
  createTaxonomy, updateTaxonomy, deleteTaxonomy,
} from "@/lib/actions";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";

export const metadata: Metadata = { title: "Admin · Taxonomies" };

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const { categories, brands, collections } = await getCachedNavData();
  return (
    <TaxonomyManager
      categories={categories}
      brands={brands}
      collections={collections}
      actions={{ createTaxonomy, updateTaxonomy, deleteTaxonomy }}
    />
  );
}
