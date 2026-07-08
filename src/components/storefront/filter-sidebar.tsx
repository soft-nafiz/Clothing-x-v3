"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Zap } from "lucide-react";
import type { Category, Brand } from "@/lib/data/types";

export interface ShopFilters {
  categories: string[];
  brands: string[];
  inStockOnly: boolean;
  priceRange: [number, number];
  sort: "newest" | "price-asc" | "price-desc" | "trending";
  flashSaleOnly: boolean;
}

interface Props {
  categories: Category[];
  brands: Brand[];
  filters: ShopFilters;
  onChange: (next: ShopFilters) => void;
  maxPrice: number;
}

export const DEFAULT_FILTERS: ShopFilters = {
  categories: [],
  brands: [],
  inStockOnly: false,
  priceRange: [0, 10000],
  sort: "newest",
  flashSaleOnly: false,
};

/** Filter body — used inside desktop sidebar and mobile Sheet. */
export function FilterSidebar({ categories, brands, filters, onChange, maxPrice }: Props) {
  function toggleCategory(id: string) {
    onChange({
      ...filters,
      categories: filters.categories.includes(id)
        ? filters.categories.filter((c) => c !== id)
        : [...filters.categories, id],
    });
  }
  function toggleBrand(id: string) {
    onChange({
      ...filters,
      brands: filters.brands.includes(id)
        ? filters.brands.filter((b) => b !== id)
        : [...filters.brands, id],
    });
  }

  return (
    <div className="space-y-6">
      {/* Sort — Select dropdown */}
      <div>
        <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sort by
        </Label>
        <Select
          value={filters.sort}
          onValueChange={(v) => onChange({ ...filters, sort: v as ShopFilters["sort"] })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="trending">Trending</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Availability */}
      <div>
        <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Availability
        </Label>
        <div className="flex items-center gap-2">
          <Checkbox
            id="in-stock"
            checked={filters.inStockOnly}
            onCheckedChange={(v) => onChange({ ...filters, inStockOnly: !!v })}
          />
          <Label htmlFor="in-stock" className="cursor-pointer text-sm">In stock only</Label>
        </div>
      </div>

      {/* Price */}
      <div>
        <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Price range
        </Label>
        <div className="px-1">
          <Slider
            min={0}
            max={maxPrice}
            step={100}
            value={filters.priceRange}
            onValueChange={(v) => onChange({ ...filters, priceRange: v as [number, number] })}
            className="my-3"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{filters.priceRange[0].toLocaleString()} taka</span>
            <span>{filters.priceRange[1].toLocaleString()} taka</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div>
        <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Categories
        </Label>
        <ScrollArea className="h-44 pr-3">
          <ul className="space-y-2.5">
            {categories.map((c) => {
              const checked = filters.categories.includes(c.id);
              return (
                <li key={c.id}>
                  <div
                    onClick={() => toggleCategory(c.id)}
                    className="flex w-full cursor-pointer items-center gap-2 text-left"
                  >
                    <Checkbox
                      id={`cat-${c.id}`}
                      checked={checked}
                      onCheckedChange={() => toggleCategory(c.id)}
                    />
                    <Label htmlFor={`cat-${c.id}`} className="cursor-pointer text-sm line-clamp-1">
                      {c.name}
                    </Label>
                  </div>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </div>

      {/* Brands */}
      <div>
        <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Brands
        </Label>
        <ScrollArea className="h-36 pr-3">
          <ul className="space-y-2.5">
            {brands.map((b) => {
              const checked = filters.brands.includes(b.id);
              return (
                <li key={b.id}>
                  <div
                    onClick={() => toggleBrand(b.id)}
                    className="flex w-full cursor-pointer items-center gap-2 text-left"
                  >
                    <Checkbox
                      id={`brand-${b.id}`}
                      checked={checked}
                      onCheckedChange={() => toggleBrand(b.id)}
                    />
                    <Label htmlFor={`brand-${b.id}`} className="cursor-pointer text-sm line-clamp-1">
                      {b.name}
                    </Label>
                  </div>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </div>

      {/* Flash Sale filter */}
      <div>
        <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary" /> Offers</span>
        </Label>
        <div onClick={() => onChange({ ...filters, flashSaleOnly: !filters.flashSaleOnly })} className="flex w-full cursor-pointer items-center gap-2 text-left">
          <Checkbox id="flash-sale" checked={filters.flashSaleOnly} onCheckedChange={() => onChange({ ...filters, flashSaleOnly: !filters.flashSaleOnly })} />
          <Label htmlFor="flash-sale" className="cursor-pointer text-sm">Flash Sale items only</Label>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => onChange({ ...DEFAULT_FILTERS, priceRange: [0, maxPrice] })}
      >
        Clear filters
      </Button>
    </div>
  );
}
