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
  const { collections } = await getCachedNavData();
  const collection = collections.find((c) => c.slug === slug);
  if (!collection) return { title: "Collection Not Found" };
  return { title: collection.name, description: collection.description ?? undefined };
}

export const revalidate = 60;

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const { categories, brands, products, collections } = await getCachedNavData();
  const collection = collections.find((c) => c.slug === slug);
  if (!collection) notFound();

  const list = products.filter((p) => p.collection_id === collection.id);

  return (
    <StorefrontShell>
      <MaxWidthWrapper className="py-8 md:py-12">
        <ShopView
          products={list}
          categories={categories}
          brands={brands}
          title={collection.name}
          subtitle={collection.description ?? undefined}
        />
      </MaxWidthWrapper>
    </StorefrontShell>
  );
}
