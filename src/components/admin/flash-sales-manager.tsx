"use client";

import { useState, useTransition, useRef, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Plus, Trash2, Zap, Clock, Calendar, Upload, X, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { DataTable } from "@/components/ui/data-table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { formatBDT } from "@/lib/format";
import type { FlashSale } from "@/lib/actions";
import type { Product } from "@/lib/data/types";

interface Props {
  initialSales: FlashSale[];
  products: Product[];
  actions: {
    createFlashSale: (s: any) => Promise<void>;
    updateFlashSale: (id: string, s: any) => Promise<void>;
    deleteFlashSale: (id: string) => Promise<void>;
  };
}

function pad(n: number) { return String(n).padStart(2, "0"); }

/** Schedule cell with mount gate to avoid hydration mismatch from timezone differences */
function ScheduleCell({ startsAt, endsAt }: { startsAt: string; endsAt: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="text-xs text-muted-foreground">
        <p>Start: —</p>
        <p>End: —</p>
      </div>
    );
  }

  const fmt = (d: string) => {
    const date = new Date(d);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  return (
    <div className="text-xs text-muted-foreground">
      <p>Start: {fmt(startsAt)}</p>
      <p>End: {fmt(endsAt)}</p>
    </div>
  );
}

function toLocalInput(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

export function FlashSalesManager({ initialSales, products, actions }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FlashSale | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FlashSale | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
    discount_percentage: 10,
    starts_at: toLocalInput(new Date().toISOString()),
    ends_at: toLocalInput(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()),
    is_active: true,
    product_ids: [] as string[],
  });
  const [productSearch, setProductSearch] = useState("");

  function openCreate() {
    setEditing(null);
    setForm({
      title: "", description: "", image: "", discount_percentage: 10,
      starts_at: toLocalInput(new Date().toISOString()),
      ends_at: toLocalInput(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()),
      is_active: true, product_ids: [],
    });
    setShowForm(true);
  }

  function openEdit(s: FlashSale) {
    setEditing(s);
    setForm({
      title: s.title,
      description: s.description ?? "",
      image: s.image ?? "",
      discount_percentage: s.discount_percentage,
      starts_at: toLocalInput(s.starts_at),
      ends_at: toLocalInput(s.ends_at),
      is_active: s.is_active,
      product_ids: s.product_ids ?? [],
    });
    setShowForm(true);
  }

  function toggleProduct(id: string) {
    setForm((f) => ({
      ...f,
      product_ids: f.product_ids.includes(id)
        ? f.product_ids.filter((p) => p !== id)
        : [...f.product_ids, id],
    }));
  }

  async function handleUpload(file: File) {
    if (!file.type.startsWith("image/")) { toast.error("Please select an image"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image too large (max 5MB)"); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "flash-sales");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.url) { toast.error("Upload failed", { description: data.error }); return; }
      setForm((f) => ({ ...f, image: data.url }));
      toast.success("Image uploaded");
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); }
  }

  function save() {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (form.product_ids.length === 0) { toast.error("Select at least one product"); return; }
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      image: form.image.trim() || null,
      discount_percentage: form.discount_percentage,
      starts_at: new Date(form.starts_at).toISOString(),
      ends_at: new Date(form.ends_at).toISOString(),
      is_active: form.is_active,
      product_ids: form.product_ids,
    };
    startTransition(async () => {
      try {
        if (editing) {
          await actions.updateFlashSale(editing.id, payload);
          toast.success("Flash sale updated");
        } else {
          await actions.createFlashSale(payload);
          toast.success("Flash sale created");
        }
        setShowForm(false);
        setEditing(null);
        router.refresh();
      } catch (err) {
        toast.error("Failed to save", { description: err instanceof Error ? err.message : "" });
      }
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      try {
        await actions.deleteFlashSale(deleteTarget.id);
        toast.success("Flash sale deleted");
        setDeleteTarget(null);
        router.refresh();
      } catch { toast.error("Failed to delete"); }
    });
  }

  function isLive(s: FlashSale) {
    const now = Date.now();
    return s.is_active && now >= new Date(s.starts_at).getTime() && now <= new Date(s.ends_at).getTime();
  }
  function isUpcoming(s: FlashSale) {
    return s.is_active && Date.now() < new Date(s.starts_at).getTime();
  }

  // Filter products by search term
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const q = productSearch.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, productSearch]);

  const columns: ColumnDef<FlashSale>[] = [
    {
      accessorKey: "title",
      header: "Sale",
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{s.title}</p>
              <p className="text-xs text-muted-foreground">{s.discount_percentage}% off · {s.product_ids.length} products</p>
            </div>
          </div>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original;
        if (isLive(s)) return <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30">Live</Badge>;
        if (isUpcoming(s)) return <Badge className="bg-amber-500/15 text-amber-500 border-amber-500/30">Upcoming</Badge>;
        if (!s.is_active) return <Badge variant="secondary">Inactive</Badge>;
        return <Badge variant="outline">Ended</Badge>;
      },
    },
    {
      id: "schedule",
      header: "Schedule",
      cell: ({ row }) => {
        const s = row.original;
        return <ScheduleCell startsAt={s.starts_at} endsAt={s.ends_at} />;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button onClick={() => openEdit(row.original)} variant="ghost" size="sm">Edit</Button>
          <Button onClick={() => setDeleteTarget(row.original)} variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">Flash Sales</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create time-limited sales with discounted products</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> New Sale
        </Button>
      </div>

      <DataTable
        columns={columns as ColumnDef<unknown>[]}
        data={initialSales}
        searchKey="title"
        searchPlaceholder="Search sales..."
        pageSize={10}
      />

      {/* Create/Edit Sheet — slides in from right */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-lg" side="right">
          {/* Header (fixed) */}
          <SheetHeader className="shrink-0 border-b border-border px-6 pt-6 pb-4">
            <SheetTitle className="font-heading text-xl font-semibold">
              {editing ? "Edit Flash Sale" : "New Flash Sale"}
            </SheetTitle>
            <SheetDescription>Set up a time-limited sale with discounted products.</SheetDescription>
          </SheetHeader>

          {/* Scrollable content area */}
          <ScrollArea className="flex-1">
            <div className="px-6 py-5">
              <div className="space-y-4">
                <div>
                  <Label className="mb-1.5 block text-xs uppercase tracking-wider">Title *</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Black Friday Flash Sale" />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs uppercase tracking-wider">Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Short description of the sale" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1.5 block text-xs uppercase tracking-wider">Starts At *</Label>
                    <Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs uppercase tracking-wider">Ends At *</Label>
                    <Input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1.5 block text-xs uppercase tracking-wider">Discount %</Label>
                    <Input type="number" min={1} max={90} value={form.discount_percentage} onChange={(e) => setForm({ ...form, discount_percentage: +e.target.value })} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <Label className="text-sm font-medium">Active</Label>
                    <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                  </div>
                </div>

                {/* Banner image upload */}
                <div>
                  <Label className="mb-1 block text-xs uppercase tracking-wider">Banner Image (optional)</Label>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ""; }} />
                  {form.image ? (
                    <div className="relative h-24 w-full overflow-hidden rounded-lg border border-border bg-muted">
                      <img src={form.image} alt="Banner" className="h-full w-full object-cover" />
                      <button type="button" onClick={() => setForm({ ...form, image: "" })} className="absolute right-2 top-2 rounded-full bg-background/90 p-1 hover:text-destructive"><X className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="flex h-24 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-foreground hover:text-foreground disabled:opacity-50">
                      {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                      <span className="text-xs">{uploading ? "Uploading..." : "Upload banner image"}</span>
                    </button>
                  )}
                </div>

                {/* Product selector with search */}
                <div>
                  <Label className="mb-1.5 block text-xs uppercase tracking-wider">Products in Sale * ({form.product_ids.length} selected)</Label>
                  <div className="relative mb-2">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search products by name..."
                      className="h-9 pl-8"
                    />
                  </div>
                  <ScrollArea className="h-64 rounded-lg border border-border">
                    <div className="p-2">
                      {filteredProducts.length === 0 ? (
                        <p className="py-4 text-center text-sm text-muted-foreground">No products found</p>
                      ) : (
                        filteredProducts.map((p) => (
                          <label key={p.id} className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-accent">
                            <input
                              type="checkbox"
                              checked={form.product_ids.includes(p.id)}
                              onChange={() => toggleProduct(p.id)}
                              className="h-4 w-4 rounded border-border"
                            />
                            <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-muted">
                              <img src={p.images?.[0]} alt="" className="h-full w-full object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-1 text-sm font-medium">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{formatBDT(p.base_price)}</p>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Footer (fixed) */}
          <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t border-border px-6 py-4">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={save} disabled={isPending}>{isPending ? "Saving..." : editing ? "Save Changes" : "Create Sale"}</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete flash sale?</AlertDialogTitle>
            <AlertDialogDescription>Delete <strong>{deleteTarget?.title}</strong>? This cannot be undone.</AlertDialogDescription>
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
