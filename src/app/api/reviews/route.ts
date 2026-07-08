import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** GET /api/reviews?product_id=xxx — fetch reviews for a product */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("product_id");
    if (!productId) {
      return NextResponse.json({ error: "product_id required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reviews: data ?? [] });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/** POST /api/reviews — submit a new review */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product_id, user_name, rating, comment } = body;

    if (!product_id || !user_name || !rating) {
      return NextResponse.json({ error: "product_id, user_name, and rating required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        product_id,
        user_id: "00000000-0000-0000-0000-000000000000", // guest user
        user_name,
        user_pfp: null,
        rating: parseInt(rating),
        comment: comment || null,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ review: data });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
