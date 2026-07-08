import { Suspense } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminNotFound } from "@/components/admin/admin-not-found";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPageSkeleton } from "@/components/admin/skeletons";

async function getAdminProfile() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Check admin: email must match one of the ADMIN_EMAIL env entries
    const adminEmails = (process.env.ADMIN_EMAIL ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const isMatch =
      adminEmails.length > 0 &&
      user.email != null &&
      adminEmails.includes(user.email.toLowerCase());

    if (!isMatch) return null;

    // Fetch profile for display name + avatar
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .single() as any;

    // Auto-set is_admin in DB
    try { await (admin.from("profiles") as any).update({ is_admin: true }).eq("id", user.id); } catch {}

    return {
      email: user.email ?? null,
      full_name: profile?.full_name ?? user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Admin",
      avatar_url: profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null,
    };
  } catch {
    return null;
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getAdminProfile();

  // Non-admin (logged in or not) → render 404 page, NOT redirect to /login
  if (!profile) {
    return <AdminNotFound />;
  }

  return (
    <AdminShell profile={profile}>
      <Suspense fallback={<AdminPageSkeleton />}>
        {children}
      </Suspense>
    </AdminShell>
  );
}
