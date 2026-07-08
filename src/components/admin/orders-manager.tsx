"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { ShoppingBag, Download, Filter, MapPin, User, Phone, Mail, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { DataTable, RowActions } from "@/components/ui/data-table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { formatBDT } from "@/lib/format";
import { generateReceiptPDF } from "@/lib/receipt";
import { updateOrderStatus } from "@/lib/actions";
import type { Order } from "@/lib/data/types";

const ORDER_STATUSES: Order["status"][] = [
  "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled",
];

const STATUS_COLORS: Record<Order["status"], string> = {
  Pending: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  Confirmed: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  Shipped: "bg-purple-500/15 text-purple-500 border-purple-500/30",
  Delivered: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  Cancelled: "bg-destructive/15 text-destructive border-destructive/30",
};

interface OrderRow extends Order {
  customer_name: string;
  customer_phone: string;
  user_email?: string | null;
  user_avatar?: string | null;
  user_full_name?: string | null;
  division?: string | null;
  district?: string | null;
  address?: string | null;
}

interface Props {
  initialOrders: OrderRow[];
}

function exportToCSV(orders: OrderRow[]) {
  const headers = ["Order ID", "Customer", "Phone", "Email", "Items", "Total", "Payment", "Status", "Date"];
  const rows = orders.map((o) => [
    o.id, o.customer_name || "", o.customer_phone || "",
    o.user_email || "", String(o.items.length), String(o.total_amount),
    o.payment_method, o.status, new Date(o.created_at).toLocaleDateString(),
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("CSV exported");
}

export function OrdersManager({ initialOrders }: Props) {
  const [orders, setOrders] = useState<OrderRow[]>(initialOrders);
  const [viewOrder, setViewOrder] = useState<OrderRow | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
     
    setOrders(initialOrders);
  }, [initialOrders]);

  async function handleStatusChange(id: string, status: Order["status"]) {
    setOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));
    try {
      await updateOrderStatus(id, status);
      toast.success(`Order → ${status}`);
    } catch {
      toast.error("Failed to update status");
      setOrders(initialOrders);
    }
  }

  function downloadReceipt(o: OrderRow) {
    const subtotal = o.total_amount - (o.delivery_charge || 0);
    generateReceiptPDF({
      orderId: o.id,
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      items: o.items,
      subtotal,
      deliveryCharge: o.delivery_charge || 0,
      discount: 0,
      total: o.total_amount,
      couponCode: o.coupon_code,
      status: o.status,
      paymentMethod: o.payment_method,
      date: o.created_at,
      address: o.address ? `${o.address}, ${o.district}, ${o.division}` : undefined,
    });
  }

  const filteredOrders = statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);

  const columns: ColumnDef<OrderRow>[] = [
    {
      accessorKey: "id",
      header: "Order ID",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.id.slice(0, 8)}</span>,
    },
    {
      accessorKey: "customer_name",
      header: "Customer",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            {row.original.user_avatar && <AvatarImage src={row.original.user_avatar} />}
            <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
              {row.original.customer_name?.charAt(0).toUpperCase() || "G"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{row.original.customer_name}</p>
            <p className="text-xs text-muted-foreground">{row.original.customer_phone}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "items",
      header: "Items",
      cell: ({ row }) => <span className="text-sm">{row.original.items.length}</span>,
    },
    {
      accessorKey: "total_amount",
      header: "Total",
      cell: ({ row }) => <span className="font-medium">{formatBDT(row.original.total_amount)}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Select value={row.original.status} onValueChange={(v) => handleStatusChange(row.original.id, v as Order["status"])}>
          <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{ORDER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{new Date(row.original.created_at).toLocaleDateString()}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <RowActions row={row} actions={[
          { label: "View Details", onClick: () => setViewOrder(row.original) },
          { label: "Download Receipt", onClick: () => downloadReceipt(row.original) },
        ]} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">{orders.length} total · {filteredOrders.length} shown</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[140px] gap-2 text-sm"><Filter className="h-3.5 w-3.5" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {ORDER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => exportToCSV(filteredOrders)} variant="outline" size="sm" className="gap-1.5" disabled={filteredOrders.length === 0}>
            <Download className="h-3.5 w-3.5" /> CSV
          </Button>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="border-dashed py-16 text-center">
          <CardContent className="pt-0">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mt-4 font-heading text-lg font-semibold">No orders yet</p>
          </CardContent>
        </Card>
      ) : (
        <DataTable columns={columns} data={filteredOrders} searchKey="customer_name" searchPlaceholder="Search by customer..." pageSize={10} />
      )}

      {/* Order Details Dialog — Full info */}
      <Dialog open={!!viewOrder} onOpenChange={(v) => !v && setViewOrder(null)}>
        <DialogContent className="max-h-[92vh] max-w-2xl gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b border-border px-6 pt-6 pb-4">
            <DialogTitle className="font-heading text-xl font-semibold">Order Details</DialogTitle>
            <DialogDescription>
              <span className="font-mono">{viewOrder?.id}</span> · {new Date(viewOrder?.created_at || "").toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {viewOrder && (
            <div className="max-h-[calc(92vh-100px)] overflow-y-auto px-6 py-5">
              <div className="space-y-5 pb-6">
                {/* Status badge */}
                <div className="flex items-center gap-2">
                  <Badge className={STATUS_COLORS[viewOrder.status]}>{viewOrder.status}</Badge>
                  <span className="text-xs text-muted-foreground">{viewOrder.payment_method}</span>
                  {viewOrder.coupon_code && <Badge variant="outline">Coupon: {viewOrder.coupon_code}</Badge>}
                </div>

                {/* Customer info card */}
                <div className="rounded-xl border border-border p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</p>
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 shrink-0">
                      {viewOrder.user_avatar && <AvatarImage src={viewOrder.user_avatar} />}
                      <AvatarFallback className="bg-primary/15 font-semibold text-primary">
                        {viewOrder.customer_name?.charAt(0).toUpperCase() || "G"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1.5 text-sm">
                      <p className="flex items-center gap-2 font-medium">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        {viewOrder.customer_name || "Guest"}
                      </p>
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        {viewOrder.customer_phone}
                      </p>
                      {viewOrder.user_email && (
                        <p className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          {viewOrder.user_email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shipping address */}
                {viewOrder.address && (
                  <div className="rounded-xl border border-border p-4">
                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> Shipping Address
                    </p>
                    <p className="text-sm text-foreground/90">{viewOrder.address}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{viewOrder.district}, {viewOrder.division}</p>
                  </div>
                )}

                {/* Items */}
                <div>
                  <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Package className="h-3.5 w-3.5" /> Items ({viewOrder.items.length})
                  </p>
                  <ul className="space-y-2">
                    {viewOrder.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-3 rounded-lg border border-border p-3">
                        <div className="h-14 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                          { }
                          <img src={item.image} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-medium">{item.name}</p>
                          {/* Show variant combination if available */}
                          <div className="mt-0.5 flex flex-wrap gap-1">
                            {item.size && <span className="text-xs text-muted-foreground">Size: {item.size}</span>}
                            {item.color && <span className="text-xs text-muted-foreground">Color: {item.color}</span>}
                            {!item.size && !item.color && <span className="text-xs text-muted-foreground">Standard</span>}
                          </div>
                          <p className="text-xs text-muted-foreground">{formatBDT(item.price)} × {item.qty}</p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold">{formatBDT(item.price * item.qty)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Totals */}
                <div className="rounded-xl border border-border p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatBDT(viewOrder.total_amount - (viewOrder.delivery_charge || 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Charge</span>
                    <span>{formatBDT(viewOrder.delivery_charge || 0)}</span>
                  </div>
                  {viewOrder.coupon_code && (
                    <div className="flex justify-between text-primary">
                      <span>Discount ({viewOrder.coupon_code})</span>
                      <span>Applied</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>{formatBDT(viewOrder.total_amount)}</span>
                  </div>
                </div>

                {/* Actions: status change + receipt */}
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Update Status</p>
                  <div className="flex gap-2">
                    <Select
                      value={viewOrder.status}
                      onValueChange={(v) => {
                        handleStatusChange(viewOrder.id, v as Order["status"]);
                        setViewOrder({ ...viewOrder, status: v as Order["status"] });
                      }}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{ORDER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button onClick={() => downloadReceipt(viewOrder)} variant="outline" className="shrink-0 gap-2">
                      <Download className="h-4 w-4" /> Download Receipt
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
