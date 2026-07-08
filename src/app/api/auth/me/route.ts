import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** GET /api/auth/me — returns the current user's profile info */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ user: null });
    }

    // Fetch profile (full_name, avatar_url) from profiles table
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", session.user.id)
      .single();

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email ?? null,
        full_name: profile?.full_name ?? session.user.user_metadata?.full_name ?? null,
        avatar_url: profile?.avatar_url ?? session.user.user_metadata?.avatar_url ?? null,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
