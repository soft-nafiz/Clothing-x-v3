"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable, RowActions } from "@/components/ui/data-table";
import {
  AlertDialog,
  AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteProduct, deleteProducts, updateProduct } from "@/lib/actions";
import { formatBDT } from "@/lib/format";
import type { Category, Brand, Collection, Product } from "@/lib/data/types";

interface Props {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  collections: Collection[];
  variantCounts?: Record<string, number>;
}

export function ProductsManager({ products, categories, brands, collections, variantCounts = {} }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  function confirmDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      try {
        await deleteProduct(deleteTarget.id);
        toast.success("Product deleted");
        setDeleteTarget(null);
        router.refresh();
      } catch {
        toast.error("Failed to delete product");
      }
    });
  }

  function confirmBulkDelete() {
    startTransition(async () => {
      try {
        await deleteProducts(selectedIds);
        toast.success(`${selectedIds.length} product(s) deleted`);
        setSelectedIds([]);
        setBulkDeleteOpen(false);
        router.refresh();
      } catch {
        toast.error("Failed to delete products");
      }
    });
  }

  function toggleFeatured(id: string, current: boolean) {
    startTransition(async () => {
      try {
        await updateProduct(id, { is_featured: !current });
        router.refresh();
      } catch {
        toast.error("Failed to update");
      }
    });
  }

  function toggleHotDeal(id: string, current: boolean) {
    startTransition(async () => {
      try {
        await updateProduct(id, { is_hot_deal: !current });
        router.refresh();
      } catch {
        toast.error("Failed to update");
      }
    });
  }

  const columns: ColumnDef<Product>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          ref={(el) => { if (el) el.indeterminate = !!table.getIsSomePageRowsSelected(); }}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            setSelectedIds(value ? table.getFilteredRowModel().rows.map((r) => r.original.id) : []);
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            setSelectedIds((prev) => value ? [...prev, row.original.id] : prev.filter((id) => id !== row.original.id));
          }}
          onClick={(e) => e.stopPropagation()}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
              { }
              <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="line-clamp-1 text-sm font-medium">{p.name}</p>
              <p className="text-xs text-muted-foreground">
                {variantCounts[p.id] ? `${variantCounts[p.id]} variants` : "No variants"}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "base_price",
      header: "Price",
      cell: ({ row }) => <span className="font-medium">{formatBDT(row.original.base_price)}</span>,
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const stock = row.original.stock;
        return (
          <Badge variant={stock === 0 ? "destructive" : stock <= 5 ? "outline" : "secondary"}>
            {stock === 0 ? "Out" : stock <= 5 ? `Low (${stock})` : stock}
          </Badge>
        );
      },
    },
    {
      id: "featured",
      header: "Featured",
      cell: ({ row }) => (
        <Switch
          checked={row.original.is_featured}
          onCheckedChange={() => toggleFeatured(row.original.id, row.original.is_featured)}
          onClick={(e) => e.stopPropagation()}
          disabled={isPending}
        />
      ),
      enableSorting: false,
    },
    {
      id: "hot_deal",
      header: "Hot Deal",
      cell: ({ row }) => (
        <Switch
          checked={row.original.is_hot_deal}
          onCheckedChange={() => toggleHotDeal(row.original.id, row.original.is_hot_deal)}
          onClick={(e) => e.stopPropagation()}
          disabled={isPending}
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
            { label: "Edit", onClick: () => router.push(`/admin/products/${row.original.id}`) },
            { label: "Delete", variant: "destructive", onClick: () => setDeleteTarget(row.original) },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length} product{products.length !== 1 && "s"} in your catalogue
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={products}
        searchKey="name"
        searchPlaceholder="Search products..."
        pageSize={10}
        selectionToolbar={(count) => (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{count} selected</span>
            <Button
              variant="destructive"
              size="sm"
              className="gap-1.5"
              onClick={() => setBulkDeleteOpen(true)}
              disabled={isPending}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete Selected
            </Button>
          </div>
        )}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteTarget?.name}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.length} products?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedIds.length} product{selectedIds.length !== 1 && "s"}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
