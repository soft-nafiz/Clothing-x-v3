import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

interface CheckoutItem {
  product_id: string;
  name: string;
  image: string;
  price: number;
  qty: number;
  size?: string;
  color?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      items,
      total_amount,
      delivery_charge,
      coupon_code,
      agent_code,
      customer_name,
      customer_phone,
      division,
      district,
      address,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }
    if (!customer_name || !customer_phone) {
      return NextResponse.json({ error: "Customer name and phone required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get user_id from the auth session (not from the request body — that's insecure)
    let userId: string | null = null;
    try {
      const authClient = await createClient();
      const { data: { user } } = await authClient.auth.getUser();
      if (user) userId = user.id;
    } catch {
      // Guest checkout — no user
    }

    // Resolve agent_id if agent_code is provided
    let agent_id: string | null = null;
    let agentCommission = 0;
    if (agent_code) {
      const { data: agent } = await supabase
        .from("agents")
        .select("id, commission_percentage, balance")
        .eq("agent_code", agent_code.toUpperCase())
        .single() as any;
      if (agent) {
        agent_id = agent.id;
        agentCommission = Number(agent.commission_percentage) || 0;
      }
    }

    // Create the order
    const orderData: Record<string, unknown> = {
      user_id: userId, // null for guest checkout
      items: items as CheckoutItem[],
      total_amount,
      delivery_charge,
      payment_method: "COD",
      status: "Pending",
      coupon_code: coupon_code || null,
      agent_id,
      customer_name,
      customer_phone,
      division,
      district,
      address,
    };

    const { data: order, error } = await (supabase as any)
      .from("orders")
      .insert(orderData)
      .select("id")
      .single();

    if (error) {
      console.error("Order creation error:", error);
      return NextResponse.json({ error: "Failed to create order: " + error.message }, { status: 500 });
    }

    // Update product sales_count and stock
    for (const item of items as CheckoutItem[]) {
      const { data: product } = await (supabase
        .from("products")
        .select("sales_count, stock")
        .eq("id", item.product_id)
        .single() as any);

      if (product) {
        const newSalesCount = ((product as any).sales_count || 0) + item.qty;
        const newStock = Math.max(0, ((product as any).stock || 0) - item.qty);
        await (supabase as any)
          .from("products")
          .update({ sales_count: newSalesCount, stock: newStock })
          .eq("id", item.product_id);
      }
    }

    // Update agent balance if an agent code was used
    if (agent_id && agentCommission > 0) {
      const subtotal = total_amount - (delivery_charge || 0);
      const commissionEarned = (subtotal * agentCommission) / 100;
      try {
        const { data: agent } = await (supabase
          .from("agents")
          .select("balance")
          .eq("id", agent_id)
          .single() as any);
        const currentBalance = Number((agent as any)?.balance) || 0;
        await (supabase.from("agents") as any)
          .update({ balance: currentBalance + commissionEarned })
          .eq("id", agent_id);
      } catch (err) {
        console.error("Agent balance update error:", err);
      }
    }

    return NextResponse.json({
      success: true,
      order_id: (order as any).id,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Server error: " + (err instanceof Error ? err.message : "Unknown") },
      { status: 500 }
    );
  }
}
