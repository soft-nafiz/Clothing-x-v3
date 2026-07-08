import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** POST /api/auth/check-admin — checks if a user_id is an admin */
export async function POST(req: NextRequest) {
  try {
    const { user_id } = await req.json();
    if (!user_id) {
      return NextResponse.json({ error: "user_id required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user_id)
      .single();

    if (error || !data) {
      // Fallback: check by email if it's the known admin email
      const { data: userData } = await supabase.auth.admin.getUserById(user_id);
      const isAdmin = userData?.user?.email?.toLowerCase() === "nafizmahmud790@gmail.com";
      if (isAdmin) {
        // Set is_admin = true in the profiles table
        await supabase.from("profiles").update({ is_admin: true }).eq("id", user_id);
        return NextResponse.json({ is_admin: true });
      }
      return NextResponse.json({ is_admin: false });
    }

    return NextResponse.json({ is_admin: !!data.is_admin });
  } catch {
    return NextResponse.json({ is_admin: false });
  }
}
