import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { MaxWidthWrapper } from "@/components/shared/max-width-wrapper";
import { ProductDetailClient } from "@/components/storefront/product-detail-client";
import { getCachedNavData } from "@/lib/data/access";
import { fetchProductOptions, fetchProductVariants } from "@/lib/actions";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { products } = await getCachedNavData();
  const product = products.find((p) => p.id === id);
  if (!product) return { title: "Product Not Found" };

  const description = product.meta_description || product.description?.[0]?.text || product.name;
  const title = product.meta_title || `${product.name} — CLOTHING X`;
  const keywords = product.keywords?.length > 0 ? product.keywords : undefined;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: `/products/${product.id}`,
      type: "website",
      siteName: "CLOTHING X",
      images: product.images.map((url) => ({ url, width: 800, height: 1000, alt: product.name })),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.images.slice(0, 1),
    },
    alternates: {
      canonical: `/products/${product.id}`,
    },
  };
}

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const { products, categories, brands } = await getCachedNavData();
  const product = products.find((p) => p.id === id);

  if (!product) notFound();

  const related = products
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.category_id === product.category_id ||
          p.brand_id === product.brand_id ||
          p.collection_id === product.collection_id),
    )
    .slice(0, 4);

  // Fetch options and variants from new tables
  const [options, variants] = await Promise.all([
    fetchProductOptions(id),
    fetchProductVariants(id),
  ]);

  // Build JSON-LD structured data for Google
  const category = categories.find((c) => c.id === product.category_id);
  const brand = brands.find((b) => b.id === product.brand_id);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.meta_description || product.description?.[0]?.text || product.name,
    sku: product.id,
    brand: brand ? { "@type": "Brand", name: brand.name } : undefined,
    category: category?.name,
    offers: {
      "@type": "Offer",
      price: product.base_price,
      priceCurrency: "BDT",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `/products/${product.id}`,
    },
    keywords: product.keywords?.join(", ") || undefined,
  };

  return (
    <>
    <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    <StorefrontShell>
      
      <MaxWidthWrapper>
        <ProductDetailClient
          product={product}
          related={related}
          options={options}
          variants={variants}
        />
      </MaxWidthWrapper>
    </StorefrontShell></>
  );
}
