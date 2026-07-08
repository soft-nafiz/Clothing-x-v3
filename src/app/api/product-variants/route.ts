import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/product-variants?product_id=xxx
 * Fetches product options and variants for the new variant system.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("product_id");

    if (!productId) {
      return NextResponse.json({ error: "product_id required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch options and variants in parallel
    const [optionsRes, variantsRes] = await Promise.all([
      (supabase as any)
        .from("product_options")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: true }),
      (supabase as any)
        .from("product_variants")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: true }),
    ]);

    return NextResponse.json({
      options: optionsRes.data ?? [],
      variants: variantsRes.data ?? [],
    });
  } catch {
    return NextResponse.json({ options: [], variants: [] });
  }
}
