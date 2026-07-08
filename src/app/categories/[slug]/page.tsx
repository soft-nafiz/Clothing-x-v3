import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { ShopView } from "@/components/storefront/shop-view";
import { MaxWidthWrapper } from "@/components/shared/max-width-wrapper";
import { getCachedNavData } from "@/lib/data/access";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { categories } = await getCachedNavData();
  const category = categories.find((c) => c.slug === slug);
  if (!category) return { title: "Category Not Found" };
  return { title: category.name, description: category.description ?? undefined };
}

export const revalidate = 60;

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const { categories, brands, products } = await getCachedNavData();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const list = products.filter((p) => p.category_id === category.id);

  return (
    <StorefrontShell>
      <MaxWidthWrapper className="py-8 md:py-12">
        <ShopView
          products={list}
          categories={categories}
          brands={brands}
          title={category.name}
          subtitle={category.description ?? undefined}
          lockedCategoryId={category.id}
        />
      </MaxWidthWrapper>
    </StorefrontShell>
  );
}
