import type { Metadata } from "next";
import { fetchOrders } from "@/lib/actions";
import { fetchOrdersWithUserInfo } from "@/lib/actions";
import { OrdersManager } from "@/components/admin/orders-manager";

export const metadata: Metadata = { title: "Admin · Orders" };

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await fetchOrdersWithUserInfo();
  return <OrdersManager initialOrders={orders} />;
}
