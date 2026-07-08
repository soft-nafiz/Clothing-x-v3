"use client";

import { useState, useMemo } from "react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer,
  XAxis, YAxis, Bar, BarChart, Tooltip as RechartsTooltip,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { TrendingUp, DollarSign, ShoppingBag } from "lucide-react";
import { formatBDT } from "@/lib/format";

interface Order {
  id: string;
  total_amount: number;
  created_at: string;
  status: string;
}

interface Props {
  initialOrders: Order[];
}

type RangeKey = "3d" | "7d" | "1m" | "3m";

const RANGE_DAYS: Record<RangeKey, number> = {
  "3d": 3,
  "7d": 7,
  "1m": 30,
  "3m": 90,
};

const RANGE_LABELS: Record<RangeKey, string> = {
  "3d": "Last 3 days",
  "7d": "Last 7 days",
  "1m": "Last 1 month",
  "3m": "Last 3 months",
};

interface RangeDate {
  label: string;
  date: string;
}

function getRangeDates(days: number): RangeDate[] {
  const dates: RangeDate[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push({
      label: days <= 7
        ? d.toLocaleDateString("en-US", { weekday: "short" })
        : d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      date: d.toISOString().split("T")[0],
    });
  }
  return dates;
}

interface ChartDataPoint {
  label: string;
  revenue: number;
  orders: number;
}

export function DashboardCharts({ initialOrders }: Props) {
  const orders = initialOrders;
  const [range, setRange] = useState<RangeKey>("7d");

  const days = RANGE_DAYS[range];
  const rangeDates = useMemo(() => getRangeDates(days), [days]);

  const chartData = useMemo((): ChartDataPoint[] => {
    return rangeDates.map((day) => {
      const dayOrders = orders.filter((o) => o.created_at?.startsWith(day.date));
      // Revenue only counts DELIVERED orders
      const deliveredOrders = dayOrders.filter((o) => o.status === "Delivered");
      return {
        label: day.label,
        revenue: deliveredOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
        orders: dayOrders.length,
      };
    });
  }, [rangeDates, orders]);

  const totalRevenue = chartData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = chartData.reduce((s, d) => s + d.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="space-y-4">
      {/* Time range selector */}
      <div className="flex items-center justify-end gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Range:</span>
        <Select value={range} onValueChange={(v) => setRange(v as RangeKey)}>
          <SelectTrigger className="h-8 w-[160px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(RANGE_DAYS) as RangeKey[]).map((k) => (
              <SelectItem key={k} value={k}>{RANGE_LABELS[k]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Revenue + Orders side by side */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 font-heading text-base font-semibold">
                <DollarSign className="h-4 w-4 text-primary" />
                Revenue
              </CardTitle>
              <CardDescription>{RANGE_LABELS[range]} · Delivered only</CardDescription>
            </div>
            <div className="text-right">
              <p className="font-heading text-xl font-semibold">
                {totalRevenue.toLocaleString()} <span className="text-xs text-muted-foreground">taka</span>
              </p>
              <p className="flex items-center justify-end gap-1 text-xs text-emerald-500">
                <TrendingUp className="h-3 w-3" />
                {totalOrders} orders
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={10} width={40} stroke="var(--muted-foreground)" />
                <RechartsTooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(value) => [`${Number(value).toLocaleString()} taka`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#fillRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 font-heading text-base font-semibold">
                <ShoppingBag className="h-4 w-4 text-emerald-500" />
                Orders
              </CardTitle>
              <CardDescription>{RANGE_LABELS[range]}</CardDescription>
            </div>
            <div className="text-right">
              <p className="font-heading text-xl font-semibold">{totalOrders}</p>
              <p className="text-xs text-muted-foreground">
                Avg {formatBDT(Math.round(avgOrderValue))}
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={10} width={30} allowDecimals={false} stroke="var(--muted-foreground)" />
                <RechartsTooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(value) => [String(value), "Orders"]}
                />
                <Bar
                  dataKey="orders"
                  fill="var(--chart-2)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}