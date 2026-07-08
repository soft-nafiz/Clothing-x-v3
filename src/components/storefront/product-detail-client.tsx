"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ShoppingBag, Star, Truck, ShieldCheck, RefreshCw, ChevronRight, Minus, Plus, AlertCircle, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatBDT, discountPercent } from "@/lib/format";
import { useCart } from "@/lib/stores/cart-store";
import { ProductCard } from "@/components/storefront/product-card";
import type { Product, Review, RichTextBlock } from "@/lib/data/types";
import type { ProductOption, ProductVariant } from "@/lib/data/variant-types";
import { getColorHex } from "@/lib/data/colors";
import { ProductShareButtons } from "@/components/storefront/product-share-buttons";

interface Props {
  product: Product;
  related: Product[];
  options: ProductOption[];
  variants: ProductVariant[];
}

export function ProductDetailClient({ product, related, options, variants }: Props) {
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [optionError, setOptionError] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [newName, setNewName] = useState("");
  const { addItem, openCart } = useCart();
  const router = useRouter();
  const [zoom, setZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveImg(0);
     
    setQty(1);
     
    setSelectedOptions({});
     
    setOptionError(false);
  }, [product.id]);

  useEffect(() => {
    // Fetch reviews from Supabase via API
    fetch(`/api/reviews?product_id=${product.id}`)
      .then((r) => r.json())
      .then((data) => {
         
        setReviews(data.reviews ?? []);
      })
      .catch(() => {
         
        setReviews([]);
      });
  }, [product.id]);

  const off = discountPercent(product.base_price, product.compare_price);

  // New variant system: options + variants from product_options/product_variants tables
  const hasVariants = options.length > 0 && variants.length > 0;
  const soldOut = !hasVariants && product.stock <= 0;

  /** Find the matching variant for current selections */
  const selectedVariant = useMemo(() => {
    if (!hasVariants || Object.keys(selectedOptions).length !== options.length) return null;
    return variants.find((v) => {
      return options.every((opt) => v.combination[opt.name] === selectedOptions[opt.name]);
    });
  }, [selectedOptions, options, variants, hasVariants]);

  /** Check if a specific option value is available given current selections */
  function isOptionAvailable(optionName: string, value: string): boolean {
    if (variants.length === 0) return true;
    // Build a tentative combination with this value
    const tentative = { ...selectedOptions, [optionName]: value };
    // Check if any variant matches all selected options + this value AND has stock
    return variants.some((v) => {
      return Object.entries(tentative).every(([key, val]) => v.combination[key] === val) && v.stock > 0;
    });
  }

  /** Get the effective price (variant override or base price) */
  const effectivePrice = selectedVariant?.price_override ?? product.base_price;

  function handleAdd() {
    if (hasVariants) {
      // Check all options are selected
      const allSelected = options.every((opt) => selectedOptions[opt.name]);
      if (!allSelected) {

        setOptionError(true);
        document.getElementById("variant-selector")?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      if (!selectedVariant || selectedVariant.stock <= 0) {
        toast.error("This variant is out of stock");
        return;
      }
    }
    // Add to cart with variant info
    if (selectedVariant) {
      addItem(product, qty, selectedVariant.combination?.Size, selectedVariant.combination?.Color);
    } else {
      addItem(product, qty);
    }
    toast.success("Added to cart", { description: `${qty} × ${product.name}` });
    openCart();
  }

  function handleBuyNow() {
    if (hasVariants) {
      const allSelected = options.every((opt) => selectedOptions[opt.name]);
      if (!allSelected) {
        setOptionError(true);
        document.getElementById("variant-selector")?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      if (!selectedVariant || selectedVariant.stock <= 0) {
        toast.error("This variant is out of stock");
        return;
      }
    }
    if (selectedVariant) {
      addItem(product, qty, selectedVariant.combination?.Size, selectedVariant.combination?.Color);
    } else {
      addItem(product, qty);
    }
    // Redirect to checkout immediately
    router.push("/checkout");
  }

  async function submitReview() {
    if (!newComment.trim() || !newName.trim()) {
      toast.error("Please add your name and a comment");
      return;
    }
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          user_name: newName,
          rating: newRating,
          comment: newComment,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Failed to post review", { description: data.error });
        return;
      }
      const review: Review = data.review;
      setReviews([review, ...reviews]);
      setNewComment("");
      setNewRating(5);
      toast.success("Review posted");
    } catch {
      toast.error("Failed to post review");
    }
  }

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="py-8 md:py-12">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <Link href="/shop" className="hover:text-foreground">Shop</Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <span className="truncate text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Image gallery */}
        <div className="flex flex-col gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative aspect-square overflow-hidden rounded-2xl bg-muted"
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
            }}
            onTouchStart={() => setZoom(true)}
            onTouchEnd={() => setZoom(false)}
            onTouchMove={(e) => {
              const touch = e.touches[0];
              if (!touch) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((touch.clientX - rect.left) / rect.width) * 100;
              const y = ((touch.clientY - rect.top) / rect.height) * 100;
              setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
            }}
            style={{ cursor: zoom ? "zoom-in" : "default", touchAction: "pan-y" }}
          >
            <img
              src={product.images[activeImg]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-200 ease-out"
              style={zoom ? {
                transform: `scale(2.2)`,
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
              } : undefined}
            />
            {off && (
              <Badge variant="destructive" className="absolute left-3 top-3 z-10">
                -{off}%
              </Badge>
            )}
            {/* Zoom hint badge */}
            {!zoom && (
              <div className="pointer-events-none absolute bottom-3 right-3 rounded-md bg-background/80 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground backdrop-blur">
                Hover to zoom
              </div>
            )}
          </motion.div>

          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    "relative h-20 w-20 shrink-0 overflow-hidden rounded-lg transition",
                    i === activeImg ? "ring-2 ring-primary" : "opacity-60 hover:opacity-100",
                  )}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info column */}
        <div className="flex flex-col">
          <div className="flex flex-wrap gap-2">
            {product.is_featured && (
              <Badge className="bg-primary text-primary-foreground">Featured</Badge>
            )}
            {product.is_hot_deal && (
              <Badge variant="outline" className="border-primary/40 text-primary">Hot Deal</Badge>
            )}
          </div>

          <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={cn(
                    "h-4 w-4",
                    n <= Math.round(avgRating)
                      ? "fill-primary text-primary"
                      : "text-muted-foreground",
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {reviews.length > 0
                ? `${avgRating.toFixed(1)} (${reviews.length} review${reviews.length !== 1 ? "s" : ""})`
                : "No reviews yet"}
            </span>
          </div>

          {/* Price */}
          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-serif text-3xl font-semibold text-foreground">
              {formatBDT(effectivePrice)}
            </span>
            {product.compare_price && (
              <span className="text-lg text-muted-foreground line-through">
                {formatBDT(product.compare_price)}
              </span>
            )}
            {off && (
              <span className="text-sm font-semibold text-primary">Save {off}%</span>
            )}
          </div>

          <Separator className="my-5" />

          {/* Description preview */}
          <div className="prose prose-invert max-w-none text-sm text-muted-foreground">
            <RichTextRenderer blocks={product.description} />
          </div>

          {/* Variant Selector — Phase 3 smart availability */}
          {hasVariants && (
            <div id="variant-selector" className="mt-6 space-y-4">
              {options.map((opt) => {
                const isColor = opt.name.toLowerCase() === "color";
                return (
                <div key={opt.id}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {opt.name}{isColor && selectedOptions[opt.name] ? `: ${selectedOptions[opt.name]}` : ""}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {opt.values.map((val) => {
                      const isAvailable = isOptionAvailable(opt.name, val);
                      const isSelected = selectedOptions[opt.name] === val;
                      const hex = isColor ? getColorHex(val) : null;
                      if (isColor && hex) {
                        return (
                          <button
                            key={val}
                            onClick={() => {
                              setSelectedOptions((prev) => ({ ...prev, [opt.name]: val }));
                              setOptionError(false);
                            }}
                            disabled={!isAvailable}
                            title={val}
                            aria-label={val}
                            className={cn(
                              "relative h-9 w-9 rounded-full border-2 transition-all",
                              isSelected
                                ? "border-primary ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
                                : isAvailable
                                  ? "border-border hover:border-foreground hover:scale-110"
                                  : "border-border opacity-40 cursor-not-allowed"
                            )}
                          >
                            <span className="block h-full w-full rounded-full border border-black/10" style={{ backgroundColor: hex }} />
                            {!isAvailable && (
                              <span className="absolute inset-0 rotate-45">
                                <span className="absolute left-1/2 top-1/2 h-0.5 w-11 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-destructive" />
                              </span>
                            )}
                          </button>
                        );
                      }
                      return (
                        <button
                          key={val}
                          onClick={() => {
                            setSelectedOptions((prev) => ({ ...prev, [opt.name]: val }));
                            setOptionError(false);
                          }}
                          disabled={!isAvailable}
                          className={cn(
                            "min-w-12 rounded-lg border px-4 py-2.5 text-sm font-medium transition",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : isAvailable
                                ? "border-border bg-background hover:border-foreground"
                                : "border-border bg-muted/50 text-muted-foreground/50 cursor-not-allowed line-through",
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
              {selectedVariant && (
                <p className="text-xs text-muted-foreground">
                  {selectedVariant.stock > 0
                    ? `${selectedVariant.stock} in stock`
                    : "Out of stock"}
                </p>
              )}
            </div>
          )}

          {/* Qty + Add */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-lg bg-muted">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3 py-3 hover:bg-accent rounded-l-lg"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-12 text-center text-sm">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="px-3 py-3 hover:bg-accent rounded-r-lg"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button
              onClick={handleAdd}
              disabled={soldOut}
              size="lg"
              className="min-w-0 flex-1 gap-2 uppercase tracking-wider"
            >
              <ShoppingBag className="h-4 w-4 shrink-0" />
              <span>{soldOut ? "Sold Out" : "Add to Cart"}</span>
            </Button>
          </div>

          {/* Buy Now button — adds to cart and goes straight to checkout */}
          <div className="mt-3">
            <Button
              onClick={handleBuyNow}
              disabled={soldOut}
              size="lg"
              variant="outline"
              className="w-full gap-2 uppercase tracking-wider"
            >
              <Zap className="h-4 w-4 text-primary" />
              {soldOut ? "Sold Out" : "Buy Now"}
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-3 gap-2 text-xs text-muted-foreground sm:gap-3">
            <div className="flex min-w-0 flex-col items-center gap-1 text-center">
              <Truck className="h-5 w-5 text-primary" />
              <span>COD Nationwide</span>
            </div>
            <div className="flex min-w-0 flex-col items-center gap-1 text-center">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span>Authenticity Guaranteed</span>
            </div>
            <div className="flex min-w-0 flex-col items-center gap-1 text-center">
              <RefreshCw className="h-5 w-5 text-primary" />
              <span>7-Day Refund Portal</span>
            </div>
          </div>

          {/* Share buttons — bottom of product details */}
          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-6">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Share this product:</span>
            <ProductShareButtons product={product} productId={product.id} />
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16 pt-12">
        <h2 className="font-serif text-2xl font-semibold tracking-tight md:text-3xl">
          Customer Reviews
        </h2>

        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Submit */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Write a Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-2 block text-xs uppercase tracking-wider">Your rating</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setNewRating(n)}
                      aria-label={`Rate ${n} stars`}
                    >
                      <Star
                        className={cn(
                          "h-6 w-6 transition",
                          n <= newRating
                            ? "fill-primary text-primary"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="rev-name" className="mb-1.5 block text-xs uppercase tracking-wider">
                  Name
                </Label>
                <Input
                  id="rev-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div>
                <Label htmlFor="rev-comment" className="mb-1.5 block text-xs uppercase tracking-wider">
                  Comment
                </Label>
                <Textarea
                  id="rev-comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Tell us what you think..."
                  rows={4}
                />
              </div>
              <Button onClick={submitReview} className="w-full">Post Review</Button>
            </CardContent>
          </Card>

          {/* List */}
          <div>
            {reviews.length === 0 ? (
              <div className="rounded-lg bg-card py-16 text-center">
                <Star className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No reviews yet — be the first!</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {reviews.map((r) => (
                  <li key={r.id}>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                              {r.user_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{r.user_name}</p>
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <Star
                                    key={n}
                                    className={cn(
                                      "h-3 w-3",
                                      n <= r.rating
                                        ? "fill-primary text-primary"
                                        : "text-muted-foreground",
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(r.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {r.comment && (
                          <p className="mt-3 text-sm text-foreground/85">{r.comment}</p>
                        )}
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Related — 5-col grid */}
      {related.length > 0 && (
        <section className="mt-16 pt-12">
          <h2 className="mb-6 font-serif text-2xl font-semibold tracking-tight md:text-3xl">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/** Rich text renderer — supports HTML (from rich text editor) and legacy block format. */
function RichTextRenderer({ blocks }: { blocks: RichTextBlock[] | null | undefined }) {
  if (!blocks || blocks.length === 0) return null;

  // Check if the first block contains HTML (from the rich text editor)
  const firstBlock = blocks[0];
  if (firstBlock?.text && firstBlock.text.startsWith("<")) {
    // Render HTML content using dangerouslySetInnerHTML
    return (
      <div
        className="prose-content"
        dangerouslySetInnerHTML={{ __html: firstBlock.text }}
      />
    );
  }

  // Legacy block format
  return (
    <div className="space-y-3">
      {blocks.map((b, i) => {
        if (b.type === "heading") {
          const Tag = (b.level === 3 ? "h3" : "h2") as "h2" | "h3";
          return (
            <Tag
              key={i}
              className="font-heading text-xl font-semibold tracking-tight text-foreground"
            >
              {b.text}
            </Tag>
          );
        }
        if (b.type === "list" && b.items) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {b.items.map((it, j) => (
                <li key={j} className="text-sm text-muted-foreground">{it}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="text-sm leading-relaxed text-muted-foreground">
            {b.text}
          </p>
        );
      })}
    </div>
  );
}
