import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { AccountView, type AccountInitialData } from "@/components/storefront/account-view";
import { MaxWidthWrapper } from "@/components/shared/max-width-wrapper";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Not logged in -> go to login page
  if (!user) {
    redirect("/login?redirect=/account");
  }

  // Fetch profile (full_name, avatar_url) from profiles table via admin client
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  const initialData: AccountInitialData = {
    userId: user.id,
    email: user.email ?? "",
    fullName:
      (profile?.full_name as string | null) ??
      (user.user_metadata?.full_name as string | null) ??
      user.email?.split("@")[0] ??
      "Member",
    avatarUrl:
      (profile?.avatar_url as string | null) ??
      (user.user_metadata?.avatar_url as string | null) ??
      null,
  };

  return (
    <StorefrontShell>
      <MaxWidthWrapper className="py-8 md:py-12">
        <AccountView initialData={initialData} />
      </MaxWidthWrapper>
    </StorefrontShell>
  );
}
