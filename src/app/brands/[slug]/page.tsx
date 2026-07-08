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
  const { brands } = await getCachedNavData();
  const brand = brands.find((b) => b.slug === slug);
  if (!brand) return { title: "Brand Not Found" };
  return { title: brand.name, description: brand.description ?? undefined };
}

export const revalidate = 60;

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const { categories, brands, products } = await getCachedNavData();
  const brand = brands.find((b) => b.slug === slug);
  if (!brand) notFound();

  const list = products.filter((p) => p.brand_id === brand.id);

  return (
    <StorefrontShell>
      <MaxWidthWrapper className="py-8 md:py-12">
        <ShopView
          products={list}
          categories={categories}
          brands={brands}
          title={brand.name}
          subtitle={brand.description ?? undefined}
          lockedBrandId={brand.id}
        />
      </MaxWidthWrapper>
    </StorefrontShell>
  );
}
