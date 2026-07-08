import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Admin email/password login via Supabase Auth.
 * Verifies the profile has is_admin = true before issuing a session.
 */
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Check is_admin flag in profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", data.user.id)
      .single();

    if (!profile?.is_admin) {
      // Sign out the non-admin session immediately
      await supabase.auth.signOut();
      return NextResponse.json({ error: "Not an admin account", isAdmin: false }, { status: 403 });
    }

    return NextResponse.json({
      ok: true,
      isAdmin: true,
      user: { id: data.user.id, email: data.user.email },
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
