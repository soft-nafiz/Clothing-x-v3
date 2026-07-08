import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Fetch orders by customer phone (for guest order history) or user_id (for logged-in users) */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    const userId = searchParams.get("user_id");

    const supabase = createAdminClient();

    let query = supabase.from("orders").select("*").order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    } else if (phone) {
      query = query.eq("customer_phone", phone);
    } else {
      // Return all orders (for admin view fallback)
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders: data ?? [] });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
