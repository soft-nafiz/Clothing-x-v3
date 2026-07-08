import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

const CMS_KEY = "cms_full";

/** GET /api/cms — fetch all CMS content */
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", CMS_KEY)
      .single();

    if (error || !data) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({ data: data.value });
  } catch {
    return NextResponse.json({ data: null });
  }
}

/** POST /api/cms — save all CMS content (admin only) */
export async function POST(req: NextRequest) {
  try {
    // Require admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const adminEmails = (process.env.ADMIN_EMAIL ?? "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
    if (!adminEmails.includes((user.email ?? "").toLowerCase())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const admin = createAdminClient();
    const { error } = await admin
      .from("site_content")
      .upsert({ key: CMS_KEY, value: body }, { onConflict: "key" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Revalidate storefront pages so changes reflect immediately
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/cms");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
