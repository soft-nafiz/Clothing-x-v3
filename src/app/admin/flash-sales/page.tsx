import type { Metadata } from "next";
import { FlashSalesManager } from "@/components/admin/flash-sales-manager";
import { fetchAllFlashSales, createFlashSale, updateFlashSale, deleteFlashSale } from "@/lib/actions";
import { getCachedNavData } from "@/lib/data/access";

export const metadata: Metadata = { title: "Flash Sales" };
export const dynamic = "force-dynamic";

export default async function AdminFlashSalesPage() {
  const [sales, { products }] = await Promise.all([
    fetchAllFlashSales(),
    getCachedNavData(),
  ]);

  return (
    <FlashSalesManager
      initialSales={sales}
      products={products}
      actions={{ createFlashSale, updateFlashSale, deleteFlashSale }}
    />
  );
}
