import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/** GET /api/addresses — fetch all addresses for the logged-in user */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ addresses: [] });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("addresses")
      .select("*")
      .eq("user_id", session.user.id)
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ addresses: data ?? [] });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/** POST /api/addresses — create a new address */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { label, division, district, detailed_address, phone, is_primary } = body;

    if (!division || !district || !detailed_address || !phone) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const admin = createAdminClient();

    // If setting as primary, unset all other primaries first
    if (is_primary) {
      await admin
        .from("addresses")
        .update({ is_primary: false })
        .eq("user_id", session.user.id);
    }

    const { data, error } = await admin
      .from("addresses")
      .insert({
        user_id: session.user.id,
        label: label || null,
        division,
        district,
        detailed_address,
        phone,
        is_primary: is_primary || false,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ address: data });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
