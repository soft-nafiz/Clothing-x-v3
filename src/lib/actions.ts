"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Product, Category, Brand, Collection, Agent, Order } from "@/lib/data/types";
import type { ProductOption, ProductVariant } from "@/lib/data/variant-types";
/* ================================================================== */
/* PRODUCTS                                                            */
/* ================================================================== */

export async function fetchProducts(): Promise<Product[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Product[];
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as unknown as Product;
}

export async function createProduct(product: Omit<Product, "id" | "created_at">): Promise<Product> {
  const supabase = createAdminClient();
  const { data, error } = await (supabase as any)
    .from("products")
    .insert({
      name: product.name,
      description: product.description,
      base_price: product.base_price,
      compare_price: product.compare_price,
      stock: product.stock,
      images: product.images,
      category_id: product.category_id,
      brand_id: product.brand_id,
      collection_id: product.collection_id,
      is_featured: product.is_featured,
      is_hot_deal: product.is_hot_deal,
      sales_count: product.sales_count ?? 0,
      keywords: product.keywords ?? [],
      meta_title: product.meta_title ?? null,
      meta_description: product.meta_description ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  return data as unknown as Product;
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<Product> {
  const supabase = createAdminClient();
  const updateData: Record<string, unknown> = {};
  if (product.name !== undefined) updateData.name = product.name;
  if (product.description !== undefined) updateData.description = product.description;
  if (product.base_price !== undefined) updateData.base_price = product.base_price;
  if (product.compare_price !== undefined) updateData.compare_price = product.compare_price;
  if (product.stock !== undefined) updateData.stock = product.stock;
  if (product.images !== undefined) updateData.images = product.images;
  if (product.category_id !== undefined) updateData.category_id = product.category_id;
  if (product.brand_id !== undefined) updateData.brand_id = product.brand_id;
  if (product.collection_id !== undefined) updateData.collection_id = product.collection_id;
  if (product.is_featured !== undefined) updateData.is_featured = product.is_featured;
  if (product.is_hot_deal !== undefined) updateData.is_hot_deal = product.is_hot_deal;
  if (product.sales_count !== undefined) updateData.sales_count = product.sales_count;
  if (product.keywords !== undefined) updateData.keywords = product.keywords;
  if (product.meta_title !== undefined) updateData.meta_title = product.meta_title;
  if (product.meta_description !== undefined) updateData.meta_description = product.meta_description;

  const { data, error } = await (supabase as any)
    .from("products")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  revalidatePath(`/products/${id}`);
  return data as unknown as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}

export async function deleteProducts(ids: string[]): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("products").delete().in("id", ids);
  if (error) throw error;
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}

/* ================================================================== */
/* CATEGORIES / BRANDS / COLLECTIONS                                   */
/* ================================================================== */

export async function fetchCategories(): Promise<Category[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw error;
  return (data ?? []) as unknown as Category[];
}

export async function fetchBrands(): Promise<Brand[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("brands").select("*").order("name");
  if (error) throw error;
  return (data ?? []) as unknown as Brand[];
}

export async function fetchCollections(): Promise<Collection[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("collections").select("*").order("name");
  if (error) throw error;
  return (data ?? []) as unknown as Collection[];
}

export async function createTaxonomy(
  type: "categories" | "brands" | "collections",
  item: { name: string; slug: string; image?: string | null; icon?: string | null; description?: string | null }
): Promise<void> {
  const supabase = createAdminClient();
  const insertData: Record<string, unknown> = {
    name: item.name,
    slug: item.slug,
    image: item.image ?? null,
    description: item.description ?? null,
  };
  if (item.icon !== undefined) insertData.icon = item.icon;
  const { error } = await (supabase as any).from(type).insert(insertData);
  if (error) throw error;
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function updateTaxonomy(
  type: "categories" | "brands" | "collections",
  id: string,
  item: { name: string; slug: string; image?: string | null; icon?: string | null; description?: string | null }
): Promise<void> {
  const supabase = createAdminClient();
  const updateData: Record<string, unknown> = {
    name: item.name,
    slug: item.slug,
    image: item.image ?? null,
    description: item.description ?? null,
  };
  if (item.icon !== undefined) updateData.icon = item.icon;
  const { error } = await (supabase as any)
    .from(type)
    .update(updateData)
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function deleteTaxonomy(
  type: "categories" | "brands" | "collections",
  id: string
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from(type).delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

/* ================================================================== */
/* ORDERS                                                              */
/* ================================================================== */

export async function fetchOrders(): Promise<Order[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Order[];
}

/** Fetch orders with user profile info (email, avatar, full_name) */
export async function fetchOrdersWithUserInfo(): Promise<any[]> {
  const supabase = createAdminClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];

  // For each order, fetch the user profile if user_id exists
  const ordersWithUser = await Promise.all(
    (orders ?? []).map(async (order: any) => {
      let userInfo = { user_email: null, user_avatar: null, user_full_name: null };

      if (order.user_id) {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", order.user_id)
            .single();

          // Also get email from auth
          const { data: authUser } = await supabase.auth.admin.getUserById(order.user_id);

          userInfo = {
            user_email: authUser?.user?.email ?? null,
            user_avatar: profile?.avatar_url ?? null,
            user_full_name: profile?.full_name ?? null,
          };
        } catch {
          // ignore
        }
      }

      return {
        ...order,
        ...userInfo,
        // Extract address fields from items or add as separate fields
        division: (order as any).division ?? null,
        district: (order as any).district ?? null,
        address: (order as any).address ?? null,
      };
    })
  );

  return ordersWithUser;
}

export async function updateOrderStatus(id: string, status: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/orders");
}

export async function createOrder(order: {
  user_id: string;
  items: unknown;
  total_amount: number;
  delivery_charge: number;
  payment_method: string;
  status: string;
  coupon_code?: string | null;
  agent_id?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
}): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .insert(order)
    .select("id")
    .single();
  if (error) throw error;
  revalidatePath("/admin/orders");
  return data.id;
}

/* ================================================================== */
/* AGENTS                                                              */
/* ================================================================== */

export async function fetchAgents(): Promise<Agent[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("agents").select("*").order("name");
  if (error) throw error;
  return (data ?? []) as unknown as Agent[];
}

export async function createAgent(agent: {
  name: string;
  agent_code: string;
  commission_percentage: number;
  balance?: number;
  email?: string | null;
  phone_personal?: string | null;
  phone_transaction?: string | null;
}): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await (supabase as any).from("agents").insert({
    name: agent.name,
    agent_code: agent.agent_code,
    commission_percentage: agent.commission_percentage,
    balance: agent.balance ?? 0,
    email: agent.email ?? null,
    phone_personal: agent.phone_personal ?? null,
    phone_transaction: agent.phone_transaction ?? null,
  });
  if (error) throw error;
  revalidatePath("/admin/agents");
}

export async function updateAgent(id: string, agent: {
  name: string;
  agent_code: string;
  commission_percentage: number;
  balance?: number;
  email?: string | null;
  phone_personal?: string | null;
  phone_transaction?: string | null;
}): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await (supabase as any)
    .from("agents")
    .update({
      name: agent.name,
      agent_code: agent.agent_code,
      commission_percentage: agent.commission_percentage,
      balance: agent.balance,
      email: agent.email ?? null,
      phone_personal: agent.phone_personal ?? null,
      phone_transaction: agent.phone_transaction ?? null,
    })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/agents");
}

export async function deleteAgent(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("agents").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/agents");
}

/* ================================================================== */
/* COUPONS                                                             */
/* ================================================================== */

interface Coupon {
  id: string;
  code: string;
  discount_percentage: number;
  active: boolean;
  description?: string | null;
}

export async function fetchCoupons(): Promise<Coupon[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("promotions").select("*").order("code");
  if (error) throw error;
  return (data ?? []) as unknown as Coupon[];
}

export async function createCoupon(coupon: {
  code: string;
  discount_percentage: number;
  active: boolean;
}): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("promotions").insert({
    code: coupon.code,
    discount_percentage: coupon.discount_percentage,
    active: coupon.active,
  });
  if (error) throw error;
  revalidatePath("/admin/coupons");
}

export async function updateCoupon(id: string, coupon: {
  code: string;
  discount_percentage: number;
  active: boolean;
}): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("promotions")
    .update({
      code: coupon.code,
      discount_percentage: coupon.discount_percentage,
      active: coupon.active,
    })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/coupons");
}

export async function deleteCoupon(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("promotions").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/coupons");
}

/* ================================================================== */
/* CMS CONTENT                                                         */
/* ================================================================== */

export async function fetchCMSContent(key: string): Promise<unknown | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("site_content")
    .select("value")
    .eq("key", key)
    .single();
  if (error) return null;
  return data.value;
}

export async function saveCMSContent(key: string, value: unknown): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("site_content")
    .upsert({ key, value }, { onConflict: "key" });
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/about");
}

/* ================================================================== */
/* USER PROFILE (for admin sidebar)                                    */
/* ================================================================== */

export async function fetchUserProfile(userId: string): Promise<{
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
} | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, is_admin")
    .eq("id", userId)
    .single();
  if (error || !data) return null;

  // Also fetch email from auth
  const { data: userData } = await supabase.auth.admin.getUserById(userId);
  return {
    email: userData?.user?.email ?? null,
    full_name: data.full_name,
    avatar_url: data.avatar_url,
    is_admin: data.is_admin ?? false,
  };
}

/* ================================================================== */
/* PRODUCT OPTIONS & VARIANTS (Phase 1 schema)                         */
/* ================================================================== */

export async function fetchProductOptions(productId: string): Promise<ProductOption[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("product_options")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: true });
  if (error) return [];
  return (data ?? []) as unknown as ProductOption[];
}

export async function fetchProductVariants(productId: string): Promise<ProductVariant[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: true });
  if (error) return [];
  return (data ?? []) as unknown as ProductVariant[];
}

export async function saveProductVariants(
  productId: string,
  options: { name: string; values: string[] }[],
  variants: { combination: Record<string, string>; price_override: number | null; stock: number; sku: string | null }[]
): Promise<void> {
  const supabase = createAdminClient();

  // Delete existing options and variants for this product
  await supabase.from("product_variants").delete().eq("product_id", productId);
  await supabase.from("product_options").delete().eq("product_id", productId);

  // Insert new options
  if (options.length > 0) {
    const optionRows = options.map((o) => ({
      product_id: productId,
      name: o.name,
      values: o.values,
    }));
    const { error: optError } = await supabase.from("product_options").insert(optionRows);
    if (optError) throw new Error("Failed to save options: " + optError.message);
  }

  // Insert new variants
  if (variants.length > 0) {
    const variantRows = variants.map((v) => ({
      product_id: productId,
      combination: v.combination,
      price_override: v.price_override,
      stock: v.stock,
      sku: v.sku,
    }));
    const { error: varError } = await supabase.from("product_variants").insert(variantRows);
    if (varError) throw new Error("Failed to save variants: " + varError.message);
  }

  // Update the total stock on the product
  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
  await supabase.from("products").update({ stock: totalStock }).eq("id", productId);

  revalidatePath(`/products/${productId}`);
  revalidatePath("/admin/products");
}

/* ================================================================== */
/* FLASH SALES                                                         */
/* ================================================================== */

export interface FlashSale {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  discount_percentage: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  product_ids: string[];
  created_at: string;
}

export async function fetchFlashSales(): Promise<FlashSale[]> {
  const supabase = createAdminClient();
  const { data, error } = await (supabase as any)
    .from("flash_sales")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as FlashSale[];
}

export async function fetchAllFlashSales(): Promise<FlashSale[]> {
  const supabase = createAdminClient();
  const { data, error } = await (supabase as any)
    .from("flash_sales")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as FlashSale[];
}

export async function createFlashSale(sale: {
  title: string;
  description?: string;
  image?: string;
  discount_percentage: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  product_ids: string[];
}): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await (supabase as any).from("flash_sales").insert(sale);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/flash-sales");
}

export async function updateFlashSale(id: string, sale: Partial<{
  title: string;
  description: string;
  image: string;
  discount_percentage: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  product_ids: string[];
}>): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await (supabase as any).from("flash_sales").update(sale).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/flash-sales");
}

export async function deleteFlashSale(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await (supabase as any).from("flash_sales").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/flash-sales");
}
