import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy } from "lucide-react";
import { formatBDT } from "@/lib/format";
import type { Product } from "@/lib/data/types";

interface Props {
  products: Product[];
}

export function MostSoldProducts({ products }: Props) {
  // Sort by sales_count descending
  const top = [...products]
    .sort((a, b) => b.sales_count - a.sales_count)
    .slice(0, 5);

  const maxSales = top[0]?.sales_count || 1;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 font-heading text-base font-semibold">
            <Trophy className="h-4 w-4 text-primary" />
            Most Sold Products
          </CardTitle>
          <CardDescription>Top 5 by total units sold</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
          <Link href="/admin/products">View all <ArrowRight className="h-3 w-3" /></Link>
        </Button>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        <ul className="space-y-4">
          {top.map((p, idx) => {
            const pct = Math.round((p.sales_count / maxSales) * 100);
            return (
              <li key={p.id} className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {idx + 1}
                </div>
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                  { }
                  <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="line-clamp-1 text-sm font-medium">{p.name}</p>
                    <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                      {p.sales_count} sold
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
