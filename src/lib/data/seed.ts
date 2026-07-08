import type {
  Category,
  Brand,
  Collection,
  Product,
  Agent,
  Promotion,
  Review,
  HeroSlide,
} from "./types";

/* ------------------------------------------------------------------ */
/* CATEGORIES                                                          */
/* ------------------------------------------------------------------ */
export const SEED_CATEGORIES: Category[] = [
  { id: "cat-fifa",   name: "2026 FIFA World Cup Jersey", slug: "fifa-2026-jersey", image: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&q=80", description: "Official 2026 FIFA World Cup jerseys and merchandise." },
  { id: "cat-sports", name: "Sports", slug: "sports", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80", description: "Performance sportswear engineered for athletes." },
  { id: "cat-jerseys",name: "Jerseys", slug: "jerseys", image: "https://images.unsplash.com/photo-1570417534007-3a8e9d4e4e4e?w=800&q=80", description: "Club and national team jerseys." },
  { id: "cat-trousers",name:"Trousers",slug: "trousers", image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80", description: "Premium trousers for everyday and athletic wear." },
  { id: "cat-men",    name: "Men Collection", slug: "men", image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=800&q=80", description: "Curated menswear essentials." },
  { id: "cat-women",  name: "Women Collection", slug: "women", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80", description: "Curated womenswear essentials." },
  { id: "cat-export", name: "Export Collection", slug: "export", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80", description: "Export-quality surplus pieces." },
  { id: "cat-toys",   name: "Toys & Games", slug: "toys-games", image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800&q=80", description: "Collectibles, board games and lifestyle toys." },
];

/* ------------------------------------------------------------------ */
/* BRANDS                                                              */
/* ------------------------------------------------------------------ */
export const SEED_BRANDS: Brand[] = [
  { id: "brand-nike",  name: "Nike",  slug: "nike",  image: null, description: "Just do it." },
  { id: "brand-adidas",name: "Adidas",slug: "adidas",image: null, description: "Impossible is nothing." },
  { id: "brand-puma",  name: "Puma",  slug: "puma",  image: null, description: "Forever faster." },
  { id: "brand-cx",    name: "Clothing X Originals", slug: "clothing-x-originals", image: null, description: "In-house luxury essentials by Clothing X." },
];

/* ------------------------------------------------------------------ */
/* COLLECTIONS                                                         */
/* ------------------------------------------------------------------ */
export const SEED_COLLECTIONS: Collection[] = [
  { id: "col-wc",     name: "World Cup 2026", slug: "world-cup-2026", image: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&q=80", description: "Celebrate the global game." },
  { id: "col-winter", name: "Winter Drop", slug: "winter-drop", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80", description: "Cold-weather premium layers." },
  { id: "col-summer", name: "Summer Essentials", slug: "summer-essentials", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80", description: "Breathable warm-weather staples." },
];

/* ------------------------------------------------------------------ */
/* AGENTS + PROMOTIONS                                                 */
/* ------------------------------------------------------------------ */
export const SEED_AGENTS: Agent[] = [
  { id: "agent-arif",  name: "Arif Agent",  agent_code: "ARIF10",  commission_percentage: 10, balance: 4500 },
  { id: "agent-sadia", name: "Sadia Agent", agent_code: "SADIA15", commission_percentage: 15, balance: 7200 },
  { id: "agent-tanvir",name: "Tanvir Agent",agent_code: "TANVIR12",commission_percentage: 12, balance: 3100 },
];

export const SEED_PROMOTIONS: Promotion[] = [
  { id: "promo-welcome", code: "WELCOME10", discount_percentage: 10, active: true },
  { id: "promo-fifa",    code: "FIFA2026",  discount_percentage: 20, active: true },
  { id: "promo-winter",  code: "WINTER5",   discount_percentage: 5,  active: true },
];

/* ------------------------------------------------------------------ */
/* HERO SLIDES                                                         */
/* ------------------------------------------------------------------ */
export const SEED_HERO_SLIDES: HeroSlide[] = [
  {
    title: "WORLD CUP 2026",
    subtitle: "Official jerseys. Engineered for champions.",
    cta: "Shop the Drop",
    image: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1600&q=80",
    href: "/categories/fifa-2026-jersey",
  },
  {
    title: "PERFORMANCE UNLEASHED",
    subtitle: "Sports gear built for the modern athlete.",
    cta: "Explore Sports",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1600&q=80",
    href: "/categories/sports",
  },
  {
    title: "THE GOLD STANDARD",
    subtitle: "Luxury essentials. Deliberately crafted.",
    cta: "Shop Men",
    image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1600&q=80",
    href: "/categories/men",
  },
];

/* ------------------------------------------------------------------ */
/* PRODUCTS — 18 pieces across all categories                          */
/* ------------------------------------------------------------------ */
const IMG = {
  jersey1: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=900&q=80",
  jersey2: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=900&q=80",
  jersey3: "https://images.unsplash.com/photo-1614632537190-23e4b21fe0c0?w=900&q=80",
  sports1: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=900&q=80",
  sports2: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80",
  sports3: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=900&q=80",
  men1:    "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=900&q=80",
  men2:    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=80",
  men3:    "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=900&q=80",
  women1:  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80",
  women2:  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900&q=80",
  women3:  "https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=900&q=80",
  trousers1:"https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=900&q=80",
  trousers2:"https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=900&q=80",
  toys1:   "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=900&q=80",
  toys2:   "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=900&q=80",
  export1: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&q=80",
  export2: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=900&q=80",
};

const baseDescription = (intro: string, bullets: string[]) => [
  { type: "paragraph" as const, text: intro },
  { type: "list" as const, items: bullets },
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: "prod-jersey-bd",
    name: "Bangladesh Home Jersey 2026",
    description: baseDescription(
      "The official Bangladesh home jersey for the 2026 campaign. Lightweight, breathable, and engineered for the global stage.",
      ["Dri-FIT moisture management", "Recycled polyester fabric", "Embroidered national crest", "Athletic fit"]
    ),
    base_price: 2490, compare_price: 3200,
    variants: [{ size: "S", stock: 10 }, { size: "M", stock: 15 }, { size: "L", stock: 8 }, { size: "XL", stock: 5 }],
    stock: 38, images: [IMG.jersey1, IMG.jersey2, IMG.jersey3],
    category_id: "cat-fifa", brand_id: "brand-cx", collection_id: "col-wc",
    is_featured: true, is_hot_deal: true, sales_count: 240, created_at: "2026-06-20T10:00:00Z",
  },
  {
    id: "prod-jersey-bra",
    name: "Brazil Away Jersey 2026",
    description: baseDescription("Iconic yellow refined for the away calendar. A collector's piece.", ["Authentic match details", "Slim athletic cut", "Official licensed product"]),
    base_price: 2990, compare_price: 3500,
    variants: [{ size: "M", stock: 6 }, { size: "L", stock: 9 }, { size: "XL", stock: 4 }],
    stock: 19, images: [IMG.jersey2, IMG.jersey3],
    category_id: "cat-fifa", brand_id: "brand-nike", collection_id: "col-wc",
    is_featured: true, is_hot_deal: false, sales_count: 180, created_at: "2026-06-18T10:00:00Z",
  },
  {
    id: "prod-jersey-arg",
    name: "Argentina Home Jersey 2026",
    description: baseDescription("Champions-grade home kit. Sky and white, finished with three stars.", ["Breathable mesh panels", "Regular fit", "Embroidered crest"]),
    base_price: 2890, compare_price: null,
    variants: [{ size: "S", stock: 7 }, { size: "M", stock: 11 }, { size: "L", stock: 6 }],
    stock: 24, images: [IMG.jersey3, IMG.jersey1],
    category_id: "cat-fifa", brand_id: "brand-adidas", collection_id: "col-wc",
    is_featured: false, is_hot_deal: true, sales_count: 132, created_at: "2026-06-15T10:00:00Z",
  },
  {
    id: "prod-sports-tee",
    name: "Pro Performance Tee",
    description: baseDescription("Featherlight training tee that disappears on the body.", ["4-way stretch", "Anti-odor finish", "Flatlock seams"]),
    base_price: 1290, compare_price: 1690,
    variants: [{ size: "M", stock: 20 }, { size: "L", stock: 14 }, { size: "XL", stock: 8 }],
    stock: 42, images: [IMG.sports1, IMG.sports2],
    category_id: "cat-sports", brand_id: "brand-puma", collection_id: "col-summer",
    is_featured: true, is_hot_deal: false, sales_count: 96, created_at: "2026-06-22T10:00:00Z",
  },
  {
    id: "prod-sports-shorts",
    name: "Sprint Track Shorts",
    description: baseDescription("Engineered for explosive movement and zero distraction.", ["Inner brief liner", "Zip pocket", "Reflective logo"]),
    base_price: 990, compare_price: 1290,
    variants: [{ size: "M", stock: 18 }, { size: "L", stock: 12 }],
    stock: 30, images: [IMG.sports2, IMG.sports3],
    category_id: "cat-sports", brand_id: "brand-nike", collection_id: "col-summer",
    is_featured: false, is_hot_deal: true, sales_count: 75, created_at: "2026-06-21T10:00:00Z",
  },
  {
    id: "prod-sports-jacket",
    name: "Tech Wind Jacket",
    description: baseDescription("Packable wind shell with sealed seams for unpredictable skies.", ["Water-resistant", "Stows into chest pocket", "Elastic cuffs"]),
    base_price: 3490, compare_price: 4200,
    variants: [{ size: "M", stock: 5 }, { size: "L", stock: 7 }, { size: "XL", stock: 3 }],
    stock: 15, images: [IMG.sports3, IMG.sports1],
    category_id: "cat-sports", brand_id: "brand-adidas", collection_id: "col-winter",
    is_featured: true, is_hot_deal: false, sales_count: 58, created_at: "2026-06-12T10:00:00Z",
  },
  {
    id: "prod-club-jersey",
    name: "Heritage Club Jersey",
    description: baseDescription("A modern take on a classic club strip.", ["Regular fit", "Ribbed collar", "Premium cotton blend"]),
    base_price: 1990, compare_price: 2390,
    variants: [{ size: "S", stock: 8 }, { size: "M", stock: 12 }, { size: "L", stock: 10 }],
    stock: 30, images: [IMG.jersey1, IMG.jersey2],
    category_id: "cat-jerseys", brand_id: "brand-cx", collection_id: null,
    is_featured: false, is_hot_deal: true, sales_count: 110, created_at: "2026-06-19T10:00:00Z",
  },
  {
    id: "prod-trouser-chino",
    name: "Tailored Chino Trousers",
    description: baseDescription("Refined chino with a tapered leg and clean drape.", ["Stretch cotton twill", "Slim tapered fit", "Hidden coin pocket"]),
    base_price: 2190, compare_price: null,
    variants: [{ size: "30", stock: 6 }, { size: "32", stock: 9 }, { size: "34", stock: 5 }],
    stock: 20, images: [IMG.trousers1, IMG.trousers2],
    category_id: "cat-trousers", brand_id: "brand-cx", collection_id: null,
    is_featured: true, is_hot_deal: false, sales_count: 64, created_at: "2026-06-17T10:00:00Z",
  },
  {
    id: "prod-trouser-jogger",
    name: "Premium Fleece Joggers",
    description: baseDescription("Heavyweight brushed fleece for off-duty comfort.", ["Brushed interior", "Tapered cuff", "Side pockets"]),
    base_price: 1790, compare_price: 2190,
    variants: [{ size: "M", stock: 14 }, { size: "L", stock: 10 }, { size: "XL", stock: 6 }],
    stock: 30, images: [IMG.trousers2, IMG.trousers1],
    category_id: "cat-trousers", brand_id: "brand-puma", collection_id: "col-winter",
    is_featured: false, is_hot_deal: true, sales_count: 88, created_at: "2026-06-14T10:00:00Z",
  },
  {
    id: "prod-men-oxford",
    name: "Oxford Button-Down Shirt",
    description: baseDescription("The wardrobe foundation. Crisp oxford cotton with mother-of-pearl buttons.", ["100% oxford cotton", "Regular fit", "Mother-of-pearl buttons"]),
    base_price: 1890, compare_price: 2390,
    variants: [{ size: "S", stock: 9 }, { size: "M", stock: 13 }, { size: "L", stock: 11 }, { size: "XL", stock: 7 }],
    stock: 40, images: [IMG.men1, IMG.men2],
    category_id: "cat-men", brand_id: "brand-cx", collection_id: null,
    is_featured: true, is_hot_deal: false, sales_count: 142, created_at: "2026-06-23T10:00:00Z",
  },
  {
    id: "prod-men-hoodie",
    name: "Heavyweight Hoodie",
    description: baseDescription("Dense 480gsm fleece with double-lined hood.", ["480gsm heavyweight fleece", "Kangaroo pocket", "Tonal drawcords"]),
    base_price: 2890, compare_price: 3490,
    variants: [{ size: "M", stock: 8 }, { size: "L", stock: 10 }, { size: "XL", stock: 6 }],
    stock: 24, images: [IMG.men2, IMG.men3],
    category_id: "cat-men", brand_id: "brand-cx", collection_id: "col-winter",
    is_featured: true, is_hot_deal: true, sales_count: 156, created_at: "2026-06-16T10:00:00Z",
  },
  {
    id: "prod-men-tee",
    name: "Pima Cotton Crew Tee",
    description: baseDescription("Buttery pima cotton with a clean crew neckline.", ["100% pima cotton", "Pre-shrunk", "Regular fit"]),
    base_price: 990, compare_price: 1290,
    variants: [{ size: "S", stock: 12 }, { size: "M", stock: 16 }, { size: "L", stock: 12 }],
    stock: 40, images: [IMG.men3, IMG.men1],
    category_id: "cat-men", brand_id: "brand-cx", collection_id: "col-summer",
    is_featured: false, is_hot_deal: true, sales_count: 102, created_at: "2026-06-24T10:00:00Z",
  },
  {
    id: "prod-women-dress",
    name: "Linen Wrap Dress",
    description: baseDescription("Effortless drape in breathable European linen.", ["100% European linen", "Adjustable wrap waist", "Side seam pockets"]),
    base_price: 2690, compare_price: 3190,
    variants: [{ size: "XS", stock: 6 }, { size: "S", stock: 8 }, { size: "M", stock: 9 }, { size: "L", stock: 5 }],
    stock: 28, images: [IMG.women1, IMG.women2],
    category_id: "cat-women", brand_id: "brand-cx", collection_id: "col-summer",
    is_featured: true, is_hot_deal: false, sales_count: 78, created_at: "2026-06-22T10:00:00Z",
  },
  {
    id: "prod-women-blazer",
    name: "Structured Tailored Blazer",
    description: baseDescription("Single-button blazer with sculpted shoulder line.", ["Wool-blend twill", "Functional surgeon's cuffs", "Full Bemberg lining"]),
    base_price: 3990, compare_price: null,
    variants: [{ size: "S", stock: 4 }, { size: "M", stock: 6 }, { size: "L", stock: 4 }],
    stock: 14, images: [IMG.women2, IMG.women3],
    category_id: "cat-women", brand_id: "brand-cx", collection_id: null,
    is_featured: true, is_hot_deal: false, sales_count: 41, created_at: "2026-06-13T10:00:00Z",
  },
  {
    id: "prod-women-knit",
    name: "Merino Ribbed Knit",
    description: baseDescription("Fine-gauge merino with a body-skimming rib.", ["100% extra-fine merino", "Mock neck", "Slim fit"]),
    base_price: 2290, compare_price: 2690,
    variants: [{ size: "S", stock: 7 }, { size: "M", stock: 9 }, { size: "L", stock: 5 }],
    stock: 21, images: [IMG.women3, IMG.women1],
    category_id: "cat-women", brand_id: "brand-cx", collection_id: "col-winter",
    is_featured: false, is_hot_deal: true, sales_count: 53, created_at: "2026-06-11T10:00:00Z",
  },
  {
    id: "prod-export-jacket",
    name: "Export Bomber Jacket",
    description: baseDescription("Surplus export-grade bomber with satin shell.", ["Satin nylon shell", "Ribbed cuffs and hem", "Two-way YKK zip"]),
    base_price: 3290, compare_price: 3990,
    variants: [{ size: "M", stock: 6 }, { size: "L", stock: 8 }, { size: "XL", stock: 4 }],
    stock: 18, images: [IMG.export1, IMG.export2],
    category_id: "cat-export", brand_id: "brand-cx", collection_id: null,
    is_featured: true, is_hot_deal: true, sales_count: 67, created_at: "2026-06-10T10:00:00Z",
  },
  {
    id: "prod-toys-football",
    name: "Match Football Pro",
    description: baseDescription("Tournament-grade ball with seamless thermobonded panels.", ["FIFA Quality Pro", "Thermobonded", "Match-ready"]),
    base_price: 1490, compare_price: 1890,
    variants: null,
    stock: 35, images: [IMG.toys1],
    category_id: "cat-toys", brand_id: "brand-adidas", collection_id: "col-wc",
    is_featured: false, is_hot_deal: true, sales_count: 124, created_at: "2026-06-20T10:00:00Z",
  },
  {
    id: "prod-toys-board",
    name: "Strategy Board Game",
    description: baseDescription("Premium wooden strategy game for two players.", ["Hand-finished wood", "Linen storage bag", "Ages 10+"]),
    base_price: 1990, compare_price: null,
    variants: null,
    stock: 22, images: [IMG.toys2],
    category_id: "cat-toys", brand_id: "brand-cx", collection_id: null,
    is_featured: false, is_hot_deal: false, sales_count: 38, created_at: "2026-06-09T10:00:00Z",
  },
];

/* ------------------------------------------------------------------ */
/* REVIEWS                                                             */
/* ------------------------------------------------------------------ */
export const SEED_REVIEWS: Review[] = [
  { id: "rev-1", product_id: "prod-jersey-bd", user_id: "u1", user_name: "Rahim Uddin", user_pfp: null, rating: 5, comment: "Authentic quality, fits perfectly. The fabric breathes well in Dhaka heat.", created_at: "2026-06-24T10:00:00Z" },
  { id: "rev-2", product_id: "prod-jersey-bd", user_id: "u2", user_name: "Nusrat Jahan", user_pfp: null, rating: 4, comment: "Great jersey, slightly tight on the shoulders. Size up if unsure.", created_at: "2026-06-23T10:00:00Z" },
  { id: "rev-3", product_id: "prod-men-hoodie", user_id: "u3", user_name: "Tanvir Ahmed", user_pfp: null, rating: 5, comment: "Heavyweight feel exactly as described. Worth every taka.", created_at: "2026-06-22T10:00:00Z" },
  { id: "rev-4", product_id: "prod-women-dress", user_id: "u4", user_name: "Sadia Karim", user_pfp: null, rating: 5, comment: "Linen drapes beautifully. Got compliments all evening.", created_at: "2026-06-21T10:00:00Z" },
  { id: "rev-5", product_id: "prod-sports-tee", user_id: "u5", user_name: "Imran Hossain", user_pfp: null, rating: 4, comment: "Featherlight, perfect for the gym. Could use more color options.", created_at: "2026-06-20T10:00:00Z" },
];
