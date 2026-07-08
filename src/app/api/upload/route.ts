import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Upload an image to Supabase Storage and return the public URL.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "misc";

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });

    const admin = createAdminClient();
    const bucketName = "cx-media";

    // Ensure bucket exists
    const { data: buckets } = await admin.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === bucketName);
    if (!bucketExists) {
      await admin.storage.createBucket(bucketName, { public: true });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${folder}/${user.id}-${Date.now()}.${ext}`;

    const { error: uploadError } = await admin.storage
      .from(bucketName)
      .upload(fileName, file, { contentType: file.type, cacheControl: "3600", upsert: false });

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

    const { data: urlData } = admin.storage.from(bucketName).getPublicUrl(fileName);
    return NextResponse.json({ url: urlData.publicUrl });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}
