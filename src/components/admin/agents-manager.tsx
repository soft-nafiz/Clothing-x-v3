"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { DataTable, RowActions } from "@/components/ui/data-table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatBDT } from "@/lib/format";
import type { Agent, Order } from "@/lib/data/types";

interface Props {
  initialAgents: Agent[];
  initialOrders: Order[];
  actions: {
    createAgent: (a: { name: string; agent_code: string; commission_percentage: number; balance?: number; email?: string | null; phone_personal?: string | null; phone_transaction?: string | null }) => Promise<void>;
    updateAgent: (id: string, a: { name: string; agent_code: string; commission_percentage: number; balance?: number; email?: string | null; phone_personal?: string | null; phone_transaction?: string | null }) => Promise<void>;
    deleteAgent: (id: string) => Promise<void>;
  };
}

export function AgentsManager({ initialAgents, initialOrders, actions }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Agent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Agent | null>(null);
  const [form, setForm] = useState({
    name: "",
    agent_code: "",
    commission_percentage: 10,
    balance: 0,
    email: "",
    phone_personal: "",
    phone_transaction: "",
  });

  function openCreate() {
    setEditing(null);
    setForm({ name: "", agent_code: "", commission_percentage: 10, balance: 0, email: "", phone_personal: "", phone_transaction: "" });
    setShowForm(true);
  }

  function openEdit(a: Agent) {
    setEditing(a);
    setForm({
      name: a.name,
      agent_code: a.agent_code,
      commission_percentage: a.commission_percentage,
      balance: a.balance,
      email: a.email ?? "",
      phone_personal: a.phone_personal ?? "",
      phone_transaction: a.phone_transaction ?? "",
    });
    setShowForm(true);
  }

  function save() {
    if (!form.name.trim() || !form.agent_code.trim()) {
      toast.error("Name and code are required");
      return;
    }
    const code = form.agent_code.toUpperCase();
    if (editing) {
      if (initialAgents.some((a) => a.agent_code === code && a.id !== editing.id)) {
        toast.error("Code already exists");
        return;
      }
    } else {
      if (initialAgents.some((a) => a.agent_code === code)) {
        toast.error("Code already exists");
        return;
      }
    }

    startTransition(async () => {
      try {
        if (editing) {
          await actions.updateAgent(editing.id, { ...form, agent_code: code });
          toast.success("Agent updated");
        } else {
          await actions.createAgent({ ...form, agent_code: code });
          toast.success("Agent created");
        }
        setShowForm(false);
        setEditing(null);
        router.refresh();
      } catch (err) {
        toast.error("Failed to save agent", {
          description: err instanceof Error ? err.message : "Unknown error",
        });
      }
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      try {
        await actions.deleteAgent(deleteTarget.id);
        toast.success("Agent removed");
        setDeleteTarget(null);
        router.refresh();
      } catch {
        toast.error("Failed to delete agent");
      }
    });
  }

  // Calculate performance per agent
  // Orders store agent_id (not agent_code), so filter by agent_id === agent.id
  const rows = initialAgents.map((a) => {
    const agentOrders = initialOrders.filter((o: any) => o.agent_id === a.id);
    const earned = agentOrders.reduce(
      (s, o) => s + ((o.total_amount - (o.delivery_charge || 0)) * a.commission_percentage) / 100, 0
    );
    return { ...a, earned, orderCount: agentOrders.length };
  });

  const columns: ColumnDef<typeof rows[0]>[] = [
    {
      accessorKey: "name",
      header: "Agent",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
            {row.original.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">Agent</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "agent_code",
      header: "Code",
      cell: ({ row }) => <Badge variant="outline" className="font-mono">{row.original.agent_code}</Badge>,
    },
    {
      accessorKey: "commission_percentage",
      header: "Commission",
      cell: ({ row }) => <span className="text-sm font-medium">{row.original.commission_percentage}%</span>,
    },
    {
      accessorKey: "orderCount",
      header: "Orders",
      cell: ({ row }) => <Badge variant="secondary">{row.original.orderCount}</Badge>,
    },
    {
      accessorKey: "earned",
      header: "Earned",
      cell: ({ row }) => <span className="text-sm font-medium text-emerald-500">{formatBDT(row.original.earned)}</span>,
    },
    {
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }) => <span className="text-sm font-semibold">{formatBDT(row.original.balance)}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <RowActions
          row={row}
          actions={[
            { label: "Edit Agent", onClick: () => openEdit(row.original) },
            { label: "Delete", variant: "destructive", onClick: () => setDeleteTarget(row.original) },
          ]}
        />
      ),
    },
  ];

  const totalOrders = rows.reduce((s, r) => s + r.orderCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">Agents</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {initialAgents.length} active agent{initialAgents.length !== 1 && "s"} · {totalOrders} total orders
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add Agent
        </Button>
      </div>

      <DataTable
        columns={columns as ColumnDef<unknown>[]}
        data={rows}
        searchKey="name"
        searchPlaceholder="Search agents..."
        pageSize={10}
      />

      {/* Create/Edit dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl font-semibold">
              {editing ? "Edit Agent" : "New Agent"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update agent details. The agent code is what customers use at checkout."
                : "Create a new agent. They'll receive commission on every order placed with their code."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block text-xs uppercase tracking-wider">Agent Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Arif Ahmed" />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs uppercase tracking-wider">Agent Code *</Label>
              <Input
                value={form.agent_code}
                onChange={(e) => setForm({ ...form, agent_code: e.target.value.toUpperCase() })}
                placeholder="ARIF10"
                className="font-mono uppercase"
              />
              <p className="mt-1 text-xs text-muted-foreground">Customers enter this code at checkout to get a discount.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Commission %</Label>
                <Input type="number" min={1} max={50} value={form.commission_percentage} onChange={(e) => setForm({ ...form, commission_percentage: +e.target.value })} />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Balance (taka)</Label>
                <Input type="number" value={form.balance} onChange={(e) => setForm({ ...form, balance: +e.target.value })} />
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs uppercase tracking-wider">Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="agent@example.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Phone (Personal)</Label>
                <Input type="tel" value={form.phone_personal} onChange={(e) => setForm({ ...form, phone_personal: e.target.value })} placeholder="01XXXXXXXXX" />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Phone (Transaction)</Label>
                <Input type="tel" value={form.phone_transaction} onChange={(e) => setForm({ ...form, phone_transaction: e.target.value })} placeholder="01XXXXXXXXX (bKash/Nagad)" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={save} disabled={isPending}>{isPending ? "Saving..." : editing ? "Save Changes" : "Create Agent"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete agent?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteTarget?.name}</strong> ({deleteTarget?.agent_code}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isPending}>
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
