import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/** PUT /api/addresses/[id] — update an address */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { label, division, district, detailed_address, phone, is_primary } = body;

    const admin = createAdminClient();

    // If setting as primary, unset all other primaries first
    if (is_primary) {
      await admin
        .from("addresses")
        .update({ is_primary: false })
        .eq("user_id", session.user.id);
    }

    const updateData: Record<string, unknown> = {};
    if (label !== undefined) updateData.label = label || null;
    if (division !== undefined) updateData.division = division;
    if (district !== undefined) updateData.district = district;
    if (detailed_address !== undefined) updateData.detailed_address = detailed_address;
    if (phone !== undefined) updateData.phone = phone;
    if (is_primary !== undefined) updateData.is_primary = is_primary;

    const { data, error } = await admin
      .from("addresses")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", session.user.id)
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

/** DELETE /api/addresses/[id] — delete an address */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("addresses")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
