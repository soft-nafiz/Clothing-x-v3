import type { Metadata } from "next";
import { fetchCoupons, createCoupon, updateCoupon, deleteCoupon } from "@/lib/actions";
import { CouponsManager } from "@/components/admin/coupons-manager";

export const metadata: Metadata = { title: "Admin · Coupons" };

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await fetchCoupons();
  return (
    <CouponsManager
      initialCoupons={coupons}
      actions={{ createCoupon, updateCoupon, deleteCoupon }}
    />
  );
}
