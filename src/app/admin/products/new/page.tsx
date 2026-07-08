import type { Metadata } from "next";
import { getCachedNavData } from "@/lib/data/access";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "New Product" };

export default async function NewProductPage() {
  const { categories, brands, collections } = await getCachedNavData();

  return <ProductForm categories={categories} brands={brands} collections={collections} />;
}
