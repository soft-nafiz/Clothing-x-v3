import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import {
  DollarSign, ShoppingBag, Package, Users, ArrowRight,
  AlertTriangle, Clock,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getProducts } from "@/lib/data/access";
import { fetchOrders } from "@/lib/actions";
import { DashboardCharts } from "@/components/admin/dashboard-charts";
import { MostSoldProducts } from "@/components/admin/most-sold-products";

export const metadata: Metadata = { title: "Admin Dashboard" };

export const dynamic = "force-dynamic";

async function DashboardContent() {
  const [products, orders] = await Promise.all([
    getProducts(),
    fetchOrders(),
  ]);

  const lowStock = products.filter((p) => p.stock <= 5);
  const pendingOrders = orders.filter((o: any) => o.status === "Pending");

  return (
    <>
      {/* Revenue + Orders charts with time range selector */}
      <DashboardCharts initialOrders={orders} />

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Products" value={String(products.length)} icon={Package} color="text-primary" bg="bg-primary/10" href="/admin/products" />
        <StatCard label="Total Orders" value={String(orders.length)} icon={ShoppingBag} color="text-emerald-500" bg="bg-emerald-500/10" href="/admin/orders" />
        <StatCard label="Active Agents" value="3" icon={Users} color="text-purple-500" bg="bg-purple-500/10" href="/admin/agents" />
      </div>

      {/* Most sold + Low stock */}
      <div className="grid gap-6 lg:grid-cols-2">
        <MostSoldProducts products={products} />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 font-heading text-base font-semibold">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Low Stock Alert
              </CardTitle>
              <CardDescription>Products that need restocking</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
              <Link href="/admin/products">View all <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            {lowStock.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                  <Package className="h-5 w-5 text-emerald-500" />
                </div>
                <p className="mt-3 text-sm font-medium">All products well-stocked</p>
                <p className="mt-1 text-xs text-muted-foreground">No restocking needed right now.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {lowStock.slice(0, 5).map((p) => (
                  <li key={p.id} className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                      { }
                      <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.stock === 0 ? "Out of stock" : `${p.stock} units left`}</p>
                    </div>
                    <Badge variant={p.stock === 0 ? "destructive" : "outline"} className="shrink-0">{p.stock === 0 ? "Out" : "Low"}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 font-heading text-base font-semibold">
              <Clock className="h-4 w-4 text-amber-500" />
              Pending Orders
            </CardTitle>
            <CardDescription>Orders awaiting confirmation</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
            <Link href="/admin/orders">View all <ArrowRight className="h-3 w-3" /></Link>
          </Button>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          {pendingOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <ShoppingBag className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="mt-3 text-sm font-medium">No pending orders</p>
              <p className="mt-1 text-xs text-muted-foreground">New orders will appear here automatically.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {pendingOrders.slice(0, 5).map((o: any) => (
                <li key={o.id} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm font-medium">{o.id}</p>
                    <p className="text-xs text-muted-foreground">{o.customer_name} · {new Date(o.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge variant="outline" className="text-amber-500">{o.status}</Badge>
                  <span className="text-sm font-medium">{o.total_amount.toLocaleString()} taka</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function DashboardFallback() {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Skeleton className="h-8 w-40 rounded-md" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Overview of your store&apos;s performance and recent activity.</p>
      </div>
      <Suspense fallback={<DashboardFallback />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg, href }: { label: string; value: string; icon: typeof DollarSign; color: string; bg: string; href?: string }) {
  const content = (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}><Icon className={`h-5 w-5 ${color}`} /></div>
          {href && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
        </div>
        <p className="mt-4 font-heading text-3xl font-semibold tracking-tight">{value}</p>
        <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
