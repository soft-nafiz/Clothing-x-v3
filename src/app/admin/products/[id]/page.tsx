import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCachedNavData } from "@/lib/data/access";
import { fetchProductOptions, fetchProductVariants } from "@/lib/actions";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Edit Product" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const { products, categories, brands, collections } = await getCachedNavData();
  const product = products.find((p) => p.id === id);

  if (!product) notFound();

  // Fetch options and variants from new tables
  const [options, variants] = await Promise.all([
    fetchProductOptions(id),
    fetchProductVariants(id),
  ]);

  return (
    <ProductForm
      product={product}
      categories={categories}
      brands={brands}
      collections={collections}
      initialOptions={options}
      initialVariants={variants}
    />
  );
}
