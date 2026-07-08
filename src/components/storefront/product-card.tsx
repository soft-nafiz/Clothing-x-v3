"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Minus, Plus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatBDT, discountPercent } from "@/lib/format";
import { useCart } from "@/lib/stores/cart-store";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription,
} from "@/components/ui/drawer";
import type { Product } from "@/lib/data/types";
import type { ProductOption, ProductVariant } from "@/lib/data/variant-types";
import { getColorHex } from "@/lib/data/colors";

interface Props {
  product: Product;
  index?: number;
  options?: ProductOption[];
  variants?: ProductVariant[];
  brandName?: string;
}

export function ProductCard({ product, index = 0, options: passedOptions, variants: passedVariants, brandName }: Props) {
  const { addItem, openCart } = useCart();
  const isMobile = useIsMobile();
  const [added, setAdded] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Variant state — uses passed data (no fetch needed)
  const options = passedOptions ?? [];
  const variants = passedVariants ?? [];
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(1);
  const [optionError, setOptionError] = useState(false);

  const off = discountPercent(product.base_price, product.compare_price);
  const soldOut = product.stock <= 0;
  const brandLabel = brandName ?? "";

  const hasVariants = options.length > 0 && variants.length > 0;

  // Effective price (variant override or base price)
  const selectedVariant = hasVariants && Object.keys(selectedOptions).length === options.length
    ? variants.find((v) => options.every((opt) => v.combination[opt.name] === selectedOptions[opt.name]))
    : null;
  const effectivePrice = selectedVariant?.price_override ?? product.base_price;

  function handleAdd() {
    if (soldOut) return;

    if (hasVariants) {
      setSelectedOptions({});
      setQty(1);
      setOptionError(false);
      setPickerOpen(true);
      return;
    }

    // No variants — add directly
    addItem(product, 1);
    setAdded(true);
    toast.success("Added to cart!", {
      description: "Tap the cart icon to review your order and checkout.",
    });
    setTimeout(() => setAdded(false), 1500);
    openCart();
  }

  function isOptionAvailable(optionName: string, value: string): boolean {
    if (variants.length === 0) return true;
    const tentative = { ...selectedOptions, [optionName]: value };
    return variants.some(
      (v) => Object.entries(tentative).every(([k, val]) => v.combination[k] === val) && v.stock > 0
    );
  }

  function confirmVariant() {
    const allSelected = options.every((opt) => selectedOptions[opt.name]);
    if (!allSelected) {
      setOptionError(true);
      return;
    }
    if (!selectedVariant || selectedVariant.stock <= 0) {
      toast.error("This variant is out of stock");
      return;
    }

    // Get size and color from the combination
    const size = selectedVariant.combination?.Size || selectedVariant.combination?.size;
    const color = selectedVariant.combination?.Color || selectedVariant.combination?.color;

    addItem(product, qty, size, color);
    toast.success("Added to cart!", {
      description: `${qty} × ${product.name}`,
    });
    setPickerOpen(false);
    setSelectedOptions({});
    setQty(1);
    setOptionError(false);
    openCart();
  }

  function resetPicker() {
    setSelectedOptions({});
    setQty(1);
    setOptionError(false);
  }

  const PickerContent = (
    <div className="space-y-5">
      {/* Product preview */}
      <div className="flex gap-4">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-1 flex-col justify-center">
          <h3 className="font-heading text-base font-semibold leading-tight">{product.name}</h3>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-heading text-xl font-bold text-primary">
              {formatBDT(effectivePrice)}
            </span>
            {product.compare_price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatBDT(product.compare_price)}
              </span>
            )}
          </div>
          {selectedVariant && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {selectedVariant.stock > 0 ? `${selectedVariant.stock} in stock` : "Out of stock"}
            </p>
          )}
        </div>
      </div>

      {/* Option selectors */}
      {options.map((opt) => {
        const isColor = opt.name.toLowerCase() === "color";
        return (
          <div key={opt.id}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {opt.name}{isColor && selectedOptions[opt.name] ? `: ${selectedOptions[opt.name]}` : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              {opt.values.map((val) => {
                const available = isOptionAvailable(opt.name, val);
                const selected = selectedOptions[opt.name] === val;
                const hex = isColor ? getColorHex(val) : null;

                if (isColor && hex) {
                  return (
                    <button
                      key={val}
                      onClick={() => { setSelectedOptions((prev) => ({ ...prev, [opt.name]: val })); setOptionError(false); }}
                      disabled={!available}
                      title={val}
                      aria-label={val}
                      className={cn(
                        "relative h-9 w-9 rounded-full border-2 transition-all",
                        selected ? "border-primary ring-2 ring-primary/30 ring-offset-2 ring-offset-background" : available ? "border-border hover:border-foreground hover:scale-110" : "border-border opacity-40 cursor-not-allowed"
                      )}
                    >
                      <span className="block h-full w-full rounded-full border border-black/10" style={{ backgroundColor: hex }} />
                    </button>
                  );
                }

                return (
                  <button
                    key={val}
                    onClick={() => { setSelectedOptions((prev) => ({ ...prev, [opt.name]: val })); setOptionError(false); }}
                    disabled={!available}
                    className={cn(
                      "min-w-12 rounded-lg border px-4 py-2.5 text-sm font-medium transition",
                      selected ? "border-primary bg-primary text-primary-foreground" : available ? "border-border bg-background hover:border-foreground" : "border-border bg-muted/50 text-muted-foreground/50 cursor-not-allowed line-through"
                    )}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {optionError && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          Please select all options to continue.
        </p>
      )}

      {/* Quantity */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quantity</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-border bg-background">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2.5 hover:bg-accent rounded-l-lg transition" aria-label="Decrease quantity">
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-12 text-center text-sm font-medium">{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} className="px-3 py-2.5 hover:bg-accent rounded-r-lg transition" aria-label="Increase quantity">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <span className="text-sm text-muted-foreground">
            Total: <span className="font-semibold text-foreground">{formatBDT(effectivePrice * qty)}</span>
          </span>
        </div>
      </div>

      {/* Add to Cart button */}
      <Button
        onClick={confirmVariant}
        size="lg"
        className="w-full gap-2 text-base font-semibold uppercase tracking-wider shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
      >
        <ShoppingBag className="h-5 w-5" />
        Add to Cart — {formatBDT(effectivePrice * qty)}
      </Button>
    </div>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{
          duration: 0.4,
          delay: Math.min(index * 0.05, 0.3),
          ease: [0.22, 1, 0.36, 1],
        }}
        className="group flex h-full flex-col rounded-2xl border border-border bg-card p-3 text-card-foreground transition-all hover:shadow-lg hover:shadow-primary/5"
      >
        {/* Image area */}
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
          <Link href={`/products/${product.id}`} className="block h-full w-full">
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </Link>

          {/* Badges */}
          {(product.is_featured || off || product.is_hot_deal) && (
            <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
              {product.is_featured && (
                <span className="rounded-md bg-foreground px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-background">
                  Best Seller
                </span>
              )}
              {off && (
                <span className="rounded-md bg-destructive px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-destructive-foreground">
                  -{off}%
                </span>
              )}
              {product.is_hot_deal && (
                <span className="rounded-md bg-primary px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                  Hot Deal
                </span>
              )}
            </div>
          )}

          {/* Sold out overlay */}
          {soldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
              <span className="rounded-md bg-foreground px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-background">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col px-1 pt-3">
          {brandLabel && (
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {brandLabel}
            </p>
          )}
          <Link href={`/products/${product.id}`} className="mt-0.5">
            <h3 className="line-clamp-1 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
              {product.name}
            </h3>
          </Link>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="font-heading text-lg font-bold text-foreground">
              {formatBDT(product.base_price)}
            </span>
            {product.compare_price && (
              <span className="text-xs text-muted-foreground line-through">
                {formatBDT(product.compare_price)}
              </span>
            )}
          </div>

          {/* Add to Cart — pushed to bottom */}
          <Button
            onClick={handleAdd}
            disabled={soldOut}
            size="sm"
            className="mt-4"
          >
            <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {soldOut ? "Sold Out" : added ? "Added!" : "Add to Cart"}
          </Button>
        </div>
      </motion.div>

      {/* Variant picker — Dialog on desktop, Drawer on mobile */}
      {isMobile ? (
        <Drawer
          open={pickerOpen}
          onOpenChange={(v) => { setPickerOpen(v); if (!v) resetPicker(); }}
        >
          <DrawerContent className="max-h-[90vh]">
            <DrawerHeader className="pb-2">
              <DrawerTitle className="font-heading text-lg font-semibold">Select Options</DrawerTitle>
              <DrawerDescription>Choose your preferred variant</DrawerDescription>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-6">
              {PickerContent}
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog
          open={pickerOpen}
          onOpenChange={(v) => { setPickerOpen(v); if (!v) resetPicker(); }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading text-lg font-semibold">Select Options</DialogTitle>
              <DialogDescription>Choose your preferred variant</DialogDescription>
            </DialogHeader>
            {PickerContent}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
