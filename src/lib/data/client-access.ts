"use client";

import { createClient } from "@/lib/supabase/client";
import type {
  Category, Brand, Collection, Product,
} from "./types";

/**
 * Client-side data access — used by client components (cart, checkout).
 * Fetches from Supabase. Returns empty arrays on failure (no mock data).
 */
export async function getClientNavData() {
  try {
    const supabase = createClient();
    const [catRes, brandRes, colRes, prodRes] = await Promise.all([
      supabase.from("categories").select("*").order("name"),
      supabase.from("brands").select("*").order("name"),
      supabase.from("collections").select("*").order("name"),
      supabase.from("products").select("*").order("created_at", { ascending: false }),
    ]);

    return {
      categories: (catRes.data ?? []) as unknown as Category[],
      brands: (brandRes.data ?? []) as unknown as Brand[],
      collections: (colRes.data ?? []) as unknown as Collection[],
      products: (prodRes.data ?? []) as unknown as Product[],
    };
  } catch {
    // Return empty arrays on failure — no mock data
    return {
      categories: [] as Category[],
      brands: [] as Brand[],
      collections: [] as Collection[],
      products: [] as Product[],
    };
  }
}
