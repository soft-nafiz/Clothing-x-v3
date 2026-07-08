import type { Metadata } from "next";
import { fetchAgents, fetchOrders, createAgent, updateAgent, deleteAgent } from "@/lib/actions";
import { AgentsManager } from "@/components/admin/agents-manager";

export const metadata: Metadata = { title: "Admin · Agents" };

export const dynamic = "force-dynamic";

export default async function AdminAgentsPage() {
  const [agents, orders] = await Promise.all([fetchAgents(), fetchOrders()]);
  return (
    <AgentsManager
      initialAgents={agents}
      initialOrders={orders}
      actions={{ createAgent, updateAgent, deleteAgent }}
    />
  );
}
