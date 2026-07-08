"use client";

import { useState, useTransition } from "react";
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

interface Coupon {
  id: string;
  code: string;
  discount_percentage: number;
  active: boolean;
  description?: string | null;
}

interface Props {
  initialCoupons: Coupon[];
  actions: {
    createCoupon: (c: { code: string; discount_percentage: number; active: boolean }) => Promise<void>;
    updateCoupon: (id: string, c: { code: string; discount_percentage: number; active: boolean }) => Promise<void>;
    deleteCoupon: (id: string) => Promise<void>;
  };
}

export function CouponsManager({ initialCoupons, actions }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [form, setForm] = useState({
    code: "",
    discount_percentage: 10,
    active: true,
  });

  function openCreate() {
    setEditing(null);
    setForm({ code: "", discount_percentage: 10, active: true });
    setShowForm(true);
  }

  function openEdit(c: Coupon) {
    setEditing(c);
    setForm({ code: c.code, discount_percentage: c.discount_percentage, active: c.active });
    setShowForm(true);
  }

  function save() {
    if (!form.code.trim()) {
      toast.error("Coupon code is required");
      return;
    }
    const code = form.code.toUpperCase();
    startTransition(async () => {
      try {
        if (editing) {
          await actions.updateCoupon(editing.id, { ...form, code });
          toast.success("Coupon updated");
        } else {
          await actions.createCoupon({ ...form, code });
          toast.success("Coupon created");
        }
        setShowForm(false);
        setEditing(null);
        router.refresh();
      } catch (err) {
        toast.error("Failed to save coupon", {
          description: err instanceof Error ? err.message : "Unknown error",
        });
      }
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      try {
        await actions.deleteCoupon(deleteTarget.id);
        toast.success("Coupon deleted");
        setDeleteTarget(null);
        router.refresh();
      } catch {
        toast.error("Failed to delete coupon");
      }
    });
  }

  const columns: ColumnDef<Coupon>[] = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => <Badge variant="outline" className="font-mono text-sm">{row.original.code}</Badge>,
    },
    {
      accessorKey: "discount_percentage",
      header: "Discount",
      cell: ({ row }) => <span className="font-semibold text-primary">{row.original.discount_percentage}%</span>,
    },
    {
      accessorKey: "active",
      header: "Active",
      cell: ({ row }) => (
        <Switch
          checked={row.original.active}
          disabled
        />
      ),
      enableSorting: false,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <RowActions
          row={row}
          actions={[
            { label: "Edit", onClick: () => openEdit(row.original) },
            { label: "Delete", variant: "destructive", onClick: () => setDeleteTarget(row.original) },
          ]}
        />
      ),
    },
  ];

  const activeCount = initialCoupons.filter((c) => c.active).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">Coupons</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {initialCoupons.length} coupon{initialCoupons.length !== 1 && "s"} · {activeCount} active
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add Coupon
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={initialCoupons}
        searchKey="code"
        searchPlaceholder="Search coupons..."
        pageSize={10}
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl font-semibold">
              {editing ? "Edit Coupon" : "New Coupon"}
            </DialogTitle>
            <DialogDescription>
              Customers enter this code at checkout to get a percentage off.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block text-xs uppercase tracking-wider">Coupon Code *</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="SUMMER20"
                className="font-mono uppercase"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs uppercase tracking-wider">Discount Percentage *</Label>
              <Input type="number" min={1} max={100} value={form.discount_percentage} onChange={(e) => setForm({ ...form, discount_percentage: +e.target.value })} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Active</Label>
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={save} disabled={isPending}>{isPending ? "Saving..." : editing ? "Save Changes" : "Create Coupon"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete coupon?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete coupon code <strong>{deleteTarget?.code}</strong>.
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
