import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Seed products into Supabase if the products table is empty.
 * Resolves category/brand/collection IDs by slug.
 */
export async function seedProductsIfEmpty() {
  const supabase = createAdminClient();

  // Check if products already exist
  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });
  if (count && count > 0) return;

  // Get category/brand/collection IDs by slug
  const [{ data: cats }, { data: brands }, { data: cols }] = await Promise.all([
    supabase.from("categories").select("id, slug"),
    supabase.from("brands").select("id, slug"),
    supabase.from("collections").select("id, slug"),
  ]);

  const catId = (slug: string) => cats?.find((c) => c.slug === slug)?.id ?? null;
  const brandId = (slug: string) => brands?.find((b) => b.slug === slug)?.id ?? null;
  const colId = (slug: string) => cols?.find((c) => c.slug === slug)?.id ?? null;

  const products = [
    {
      name: "Bangladesh Home Jersey 2026",
      description: [
        { type: "paragraph", text: "The official Bangladesh home jersey for the 2026 campaign. Lightweight, breathable, and engineered for the global stage." },
        { type: "list", items: ["Dri-FIT moisture management", "Recycled polyester fabric", "Embroidered national crest", "Athletic fit"] },
      ],
      base_price: 2490, compare_price: 3200,
      variants: [{ size: "S", stock: 10 }, { size: "M", stock: 15 }, { size: "L", stock: 8 }, { size: "XL", stock: 5 }],
      stock: 38, images: [
        "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=900&q=80",
        "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=900&q=80",
        "https://images.unsplash.com/photo-1614632537190-23e4b21fe0c0?w=900&q=80",
      ],
      category_slug: "fifa-2026-jersey", brand_slug: "clothing-x-originals", col_slug: "world-cup-2026",
      is_featured: true, is_hot_deal: true, sales_count: 240,
    },
    {
      name: "Brazil Away Jersey 2026",
      description: [{ type: "paragraph", text: "Iconic yellow refined for the away calendar. A collector's piece." }, { type: "list", items: ["Authentic match details", "Slim athletic cut", "Official licensed product"] }],
      base_price: 2990, compare_price: 3500,
      variants: [{ size: "M", stock: 6 }, { size: "L", stock: 9 }, { size: "XL", stock: 4 }],
      stock: 19, images: ["https://images.unsplash.com/photo-1551958219-acbc608c6377?w=900&q=80", "https://images.unsplash.com/photo-1614632537190-23e4b21fe0c0?w=900&q=80"],
      category_slug: "fifa-2026-jersey", brand_slug: "nike", col_slug: "world-cup-2026",
      is_featured: true, is_hot_deal: false, sales_count: 180,
    },
    {
      name: "Argentina Home Jersey 2026",
      description: [{ type: "paragraph", text: "Champions-grade home kit. Sky and white, finished with three stars." }, { type: "list", items: ["Breathable mesh panels", "Regular fit", "Embroidered crest"] }],
      base_price: 2890, compare_price: null,
      variants: [{ size: "S", stock: 7 }, { size: "M", stock: 11 }, { size: "L", stock: 6 }],
      stock: 24, images: ["https://images.unsplash.com/photo-1614632537190-23e4b21fe0c0?w=900&q=80", "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=900&q=80"],
      category_slug: "fifa-2026-jersey", brand_slug: "adidas", col_slug: "world-cup-2026",
      is_featured: false, is_hot_deal: true, sales_count: 132,
    },
    {
      name: "Pro Performance Tee",
      description: [{ type: "paragraph", text: "Featherlight training tee that disappears on the body." }, { type: "list", items: ["4-way stretch", "Anti-odor finish", "Flatlock seams"] }],
      base_price: 1290, compare_price: 1690,
      variants: [{ size: "M", stock: 20 }, { size: "L", stock: 14 }, { size: "XL", stock: 8 }],
      stock: 42, images: ["https://images.unsplash.com/photo-1517649763962-0c623066013b?w=900&q=80", "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80"],
      category_slug: "sports", brand_slug: "puma", col_slug: "summer-essentials",
      is_featured: true, is_hot_deal: false, sales_count: 96,
    },
    {
      name: "Sprint Track Shorts",
      description: [{ type: "paragraph", text: "Engineered for explosive movement and zero distraction." }, { type: "list", items: ["Inner brief liner", "Zip pocket", "Reflective logo"] }],
      base_price: 990, compare_price: 1290,
      variants: [{ size: "M", stock: 18 }, { size: "L", stock: 12 }],
      stock: 30, images: ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80", "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=900&q=80"],
      category_slug: "sports", brand_slug: "nike", col_slug: "summer-essentials",
      is_featured: false, is_hot_deal: true, sales_count: 75,
    },
    {
      name: "Tech Wind Jacket",
      description: [{ type: "paragraph", text: "Packable wind shell with sealed seams for unpredictable skies." }, { type: "list", items: ["Water-resistant", "Stows into chest pocket", "Elastic cuffs"] }],
      base_price: 3490, compare_price: 4200,
      variants: [{ size: "M", stock: 5 }, { size: "L", stock: 7 }, { size: "XL", stock: 3 }],
      stock: 15, images: ["https://images.unsplash.com/photo-1556906781-9a412961c28c?w=900&q=80", "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=900&q=80"],
      category_slug: "sports", brand_slug: "adidas", col_slug: "winter-drop",
      is_featured: true, is_hot_deal: false, sales_count: 58,
    },
    {
      name: "Heritage Club Jersey",
      description: [{ type: "paragraph", text: "A modern take on a classic club strip." }, { type: "list", items: ["Regular fit", "Ribbed collar", "Premium cotton blend"] }],
      base_price: 1990, compare_price: 2390,
      variants: [{ size: "S", stock: 8 }, { size: "M", stock: 12 }, { size: "L", stock: 10 }],
      stock: 30, images: ["https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=900&q=80", "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=900&q=80"],
      category_slug: "jerseys", brand_slug: "clothing-x-originals", col_slug: null,
      is_featured: false, is_hot_deal: true, sales_count: 110,
    },
    {
      name: "Tailored Chino Trousers",
      description: [{ type: "paragraph", text: "Refined chino with a tapered leg and clean drape." }, { type: "list", items: ["Stretch cotton twill", "Slim tapered fit", "Hidden coin pocket"] }],
      base_price: 2190, compare_price: null,
      variants: [{ size: "30", stock: 6 }, { size: "32", stock: 9 }, { size: "34", stock: 5 }],
      stock: 20, images: ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=900&q=80", "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=900&q=80"],
      category_slug: "trousers", brand_slug: "clothing-x-originals", col_slug: null,
      is_featured: true, is_hot_deal: false, sales_count: 64,
    },
    {
      name: "Premium Fleece Joggers",
      description: [{ type: "paragraph", text: "Heavyweight brushed fleece for off-duty comfort." }, { type: "list", items: ["Brushed interior", "Tapered cuff", "Side pockets"] }],
      base_price: 1790, compare_price: 2190,
      variants: [{ size: "M", stock: 14 }, { size: "L", stock: 10 }, { size: "XL", stock: 6 }],
      stock: 30, images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=900&q=80", "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=900&q=80"],
      category_slug: "trousers", brand_slug: "puma", col_slug: "winter-drop",
      is_featured: false, is_hot_deal: true, sales_count: 88,
    },
    {
      name: "Oxford Button-Down Shirt",
      description: [{ type: "paragraph", text: "The wardrobe foundation. Crisp oxford cotton with mother-of-pearl buttons." }, { type: "list", items: ["100% oxford cotton", "Regular fit", "Mother-of-pearl buttons"] }],
      base_price: 1890, compare_price: 2390,
      variants: [{ size: "S", stock: 9 }, { size: "M", stock: 13 }, { size: "L", stock: 11 }, { size: "XL", stock: 7 }],
      stock: 40, images: ["https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=900&q=80", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=80"],
      category_slug: "men", brand_slug: "clothing-x-originals", col_slug: null,
      is_featured: true, is_hot_deal: false, sales_count: 142,
    },
    {
      name: "Heavyweight Hoodie",
      description: [{ type: "paragraph", text: "Dense 480gsm fleece with double-lined hood." }, { type: "list", items: ["480gsm heavyweight fleece", "Kangaroo pocket", "Tonal drawcords"] }],
      base_price: 2890, compare_price: 3490,
      variants: [{ size: "M", stock: 8 }, { size: "L", stock: 10 }, { size: "XL", stock: 6 }],
      stock: 24, images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=80", "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=900&q=80"],
      category_slug: "men", brand_slug: "clothing-x-originals", col_slug: "winter-drop",
      is_featured: true, is_hot_deal: true, sales_count: 156,
    },
    {
      name: "Pima Cotton Crew Tee",
      description: [{ type: "paragraph", text: "Buttery pima cotton with a clean crew neckline." }, { type: "list", items: ["100% pima cotton", "Pre-shrunk", "Regular fit"] }],
      base_price: 990, compare_price: 1290,
      variants: [{ size: "S", stock: 12 }, { size: "M", stock: 16 }, { size: "L", stock: 12 }],
      stock: 40, images: ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=900&q=80", "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=900&q=80"],
      category_slug: "men", brand_slug: "clothing-x-originals", col_slug: "summer-essentials",
      is_featured: false, is_hot_deal: true, sales_count: 102,
    },
    {
      name: "Linen Wrap Dress",
      description: [{ type: "paragraph", text: "Effortless drape in breathable European linen." }, { type: "list", items: ["100% European linen", "Adjustable wrap waist", "Side seam pockets"] }],
      base_price: 2690, compare_price: 3190,
      variants: [{ size: "XS", stock: 6 }, { size: "S", stock: 8 }, { size: "M", stock: 9 }, { size: "L", stock: 5 }],
      stock: 28, images: ["https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80", "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900&q=80"],
      category_slug: "women", brand_slug: "clothing-x-originals", col_slug: "summer-essentials",
      is_featured: true, is_hot_deal: false, sales_count: 78,
    },
    {
      name: "Structured Tailored Blazer",
      description: [{ type: "paragraph", text: "Single-button blazer with sculpted shoulder line." }, { type: "list", items: ["Wool-blend twill", "Functional surgeon's cuffs", "Full Bemberg lining"] }],
      base_price: 3990, compare_price: null,
      variants: [{ size: "S", stock: 4 }, { size: "M", stock: 6 }, { size: "L", stock: 4 }],
      stock: 14, images: ["https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900&q=80", "https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=900&q=80"],
      category_slug: "women", brand_slug: "clothing-x-originals", col_slug: null,
      is_featured: true, is_hot_deal: false, sales_count: 41,
    },
    {
      name: "Merino Ribbed Knit",
      description: [{ type: "paragraph", text: "Fine-gauge merino with a body-skimming rib." }, { type: "list", items: ["100% extra-fine merino", "Mock neck", "Slim fit"] }],
      base_price: 2290, compare_price: 2690,
      variants: [{ size: "S", stock: 7 }, { size: "M", stock: 9 }, { size: "L", stock: 5 }],
      stock: 21, images: ["https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=900&q=80", "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900?q=80"],
      category_slug: "women", brand_slug: "clothing-x-originals", col_slug: "winter-drop",
      is_featured: false, is_hot_deal: true, sales_count: 53,
    },
    {
      name: "Export Bomber Jacket",
      description: [{ type: "paragraph", text: "Surplus export-grade bomber with satin shell." }, { type: "list", items: ["Satin nylon shell", "Ribbed cuffs and hem", "Two-way YKK zip"] }],
      base_price: 3290, compare_price: 3990,
      variants: [{ size: "M", stock: 6 }, { size: "L", stock: 8 }, { size: "XL", stock: 4 }],
      stock: 18, images: ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&q=80", "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=900&q=80"],
      category_slug: "export", brand_slug: "clothing-x-originals", col_slug: null,
      is_featured: true, is_hot_deal: true, sales_count: 67,
    },
    {
      name: "Match Football Pro",
      description: [{ type: "paragraph", text: "Tournament-grade ball with seamless thermobonded panels." }, { type: "list", items: ["FIFA Quality Pro", "Thermobonded", "Match-ready"] }],
      base_price: 1490, compare_price: 1890,
      variants: null, stock: 35,
      images: ["https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=900&q=80"],
      category_slug: "toys-games", brand_slug: "adidas", col_slug: "world-cup-2026",
      is_featured: false, is_hot_deal: true, sales_count: 124,
    },
    {
      name: "Strategy Board Game",
      description: [{ type: "paragraph", text: "Premium wooden strategy game for two players." }, { type: "list", items: ["Hand-finished wood", "Linen storage bag", "Ages 10+"] }],
      base_price: 1990, compare_price: null,
      variants: null, stock: 22,
      images: ["https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=900&q=80"],
      category_slug: "toys-games", brand_slug: "clothing-x-originals", col_slug: null,
      is_featured: false, is_hot_deal: false, sales_count: 38,
    },
  ];

  const inserts = products.map((p) => ({
    name: p.name,
    description: p.description,
    base_price: p.base_price,
    compare_price: p.compare_price,
    variants: p.variants,
    stock: p.stock,
    images: p.images,
    category_id: catId(p.category_slug),
    brand_id: brandId(p.brand_slug),
    collection_id: p.col_slug ? colId(p.col_slug) : null,
    is_featured: p.is_featured,
    is_hot_deal: p.is_hot_deal,
    sales_count: p.sales_count,
  }));

  const { error } = await supabase.from("products").insert(inserts);
  if (error) {
    console.error("Seed error:", error.message);
  } else {
    console.log(`Seeded ${inserts.length} products`);
  }
}
