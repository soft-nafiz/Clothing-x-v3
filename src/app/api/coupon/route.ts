import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: "Code required" }, { status: 400 });
    }

    const upper = code.trim().toUpperCase();
    const supabase = createAdminClient();

    // Check agents first
    const { data: agent } = await supabase
      .from("agents")
      .select("id, agent_code, commission_percentage")
      .eq("agent_code", upper)
      .single();

    if (agent) {
      return NextResponse.json({
        valid: true,
        discount: agent.commission_percentage,
        is_agent: true,
        code: agent.agent_code,
      });
    }

    // Check promotions
    const { data: promo } = await supabase
      .from("promotions")
      .select("code, discount_percentage, active")
      .eq("code", upper)
      .eq("active", true)
      .single();

    if (promo) {
      return NextResponse.json({
        valid: true,
        discount: promo.discount_percentage,
        is_agent: false,
        code: promo.code,
      });
    }

    return NextResponse.json({
      valid: false,
      error: "Invalid code",
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
