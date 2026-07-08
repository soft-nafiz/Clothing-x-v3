"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "./product-card";
import { FilterSidebar, DEFAULT_FILTERS, type ShopFilters } from "./filter-sidebar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import type { Product, Category, Brand } from "@/lib/data/types";
import type { ProductOption, ProductVariant } from "@/lib/data/variant-types";

interface Props {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  title: string;
  subtitle?: string;
  /** Lock the category filter to a single category (slug pages). */
  lockedCategoryId?: string;
  /** Lock the brand filter (brand slug pages). */
  lockedBrandId?: string;
  /** Product IDs that are currently in an active flash sale */
  flashSaleProductIds?: string[];
  /** Variant data maps */
  optionsMap?: Record<string, ProductOption[]>;
  variantsMap?: Record<string, ProductVariant[]>;
  /** Brand name map */
  brandMap?: Record<string, string>;
}

const PAGE_SIZE = 15;

export function ShopView({
  products, categories, brands, title, subtitle,
  lockedCategoryId, lockedBrandId, flashSaleProductIds = [],
  optionsMap = {}, variantsMap = {}, brandMap = {},
}: Props) {
  const [filters, setFilters] = useState<ShopFilters>({
    ...DEFAULT_FILTERS,
    categories: lockedCategoryId ? [lockedCategoryId] : [],
    brands: lockedBrandId ? [lockedBrandId] : [],
  });
  const [page, setPage] = useState(1);

  const maxPrice = useMemo(
    () => Math.max(10000, ...products.map((p) => p.base_price)),
    [products]
  );

  const filtered = useMemo(() => {
    let list = [...products];
    if (filters.categories.length) {
      list = list.filter((p) => p.category_id && filters.categories.includes(p.category_id));
    }
    if (filters.brands.length) {
      list = list.filter((p) => p.brand_id && filters.brands.includes(p.brand_id));
    }
    if (filters.inStockOnly) list = list.filter((p) => p.stock > 0);
    if (filters.flashSaleOnly && flashSaleProductIds.length > 0) {
      list = list.filter((p) => flashSaleProductIds.includes(p.id));
    }
    list = list.filter((p) => p.base_price >= filters.priceRange[0] && p.base_price <= filters.priceRange[1]);

    switch (filters.sort) {
      case "newest":
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "price-asc":
        list.sort((a, b) => a.base_price - b.base_price);
        break;
      case "price-desc":
        list.sort((a, b) => b.base_price - a.base_price);
        break;
      case "trending":
        list.sort((a, b) => b.sales_count - a.sales_count);
        break;
    }
    return list;
  }, [products, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const filterBody = (
    <FilterSidebar
      categories={categories}
      brands={brands}
      filters={filters}
      onChange={(next) => {
        setFilters(next);
        setPage(1);
      }}
      maxPrice={maxPrice}
    />
  );

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      {/* Desktop sidebar — wider (w-80) */}
      <aside className="hidden w-80 shrink-0 lg:block">
        <div className="sticky top-36">
          {filterBody}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1">
        {/* Header */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="font-serif text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            <p className="hidden text-xs text-muted-foreground sm:block">
              {filtered.length} item{filtered.length !== 1 && "s"}
            </p>
            {/* Mobile filter trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 lg:hidden">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full max-w-sm overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="font-serif text-lg">Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-4 px-4">
                  {filterBody}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Grid — 5 cols on desktop */}
        {pageItems.length === 0 ? (
          <div className="rounded-lg bg-card py-20 text-center">
            <p className="font-serif text-xl">No products found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your filters to see more results.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {pageItems.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} options={optionsMap[p.id]} variants={variantsMap[p.id]} brandName={brandMap[p.brand_id ?? ""]} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i}
                  variant={safePage === i + 1 ? "default" : "outline"}
                  size="icon"
                  className="h-9 w-9 text-sm"
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="gap-1"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
