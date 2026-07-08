/**
 * Shared domain types for CLOTHING X.
 * These mirror the Supabase schema in supabase/migrations/0001_initial_schema.sql
 * and are used by both seed data and live DB rows.
 */
import type { Json } from "@/lib/supabase/database.types";

export interface Variant {
  size?: string;
  color?: string;
  stock: number;
  sku?: string;
}

export interface RichTextBlock {
  type: "paragraph" | "heading" | "list";
  level?: 2 | 3;
  text?: string;
  items?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  icon: string | null;
  description: string | null;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
}

export interface Product {
  id: string;
  name: string;
  description: RichTextBlock[] | null;
  base_price: number;
  compare_price: number | null;
  stock: number;
  images: string[];
  category_id: string | null;
  brand_id: string | null;
  collection_id: string | null;
  is_featured: boolean;
  is_hot_deal: boolean;
  sales_count: number;
  created_at: string;
  keywords: string[];
  meta_title: string | null;
  meta_description: string | null;
}

export interface CartItem {
  product_id: string;
  name: string;
  image: string;
  price: number;
  qty: number;
  size?: string;
  color?: string;
  stock: number;
}

export interface Agent {
  id: string;
  name: string;
  agent_code: string;
  commission_percentage: number;
  balance: number;
  email: string | null;
  phone_personal: string | null;
  phone_transaction: string | null;
}

export interface Promotion {
  id: string;
  code: string;
  discount_percentage: number;
  active: boolean;
}

export interface Order {
  id: string;
  user_id: string;
  items: CartItem[];
  total_amount: number;
  delivery_charge: number;
  payment_method: string;
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
  coupon_code: string | null;
  agent_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  user_pfp: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface HeroSlide {
  title: string;
  subtitle: string;
  cta: string;
  image: string;
  href: string;
}

export type JsonValue = Json;
