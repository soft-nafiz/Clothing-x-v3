"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft, Plus, Trash2, X, Upload, Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Separator } from "@/components/ui/separator";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  createProduct, updateProduct, saveProductVariants,
} from "@/lib/actions";
import { VariantGenerator } from "@/components/admin/variant-generator";
import type { Category, Brand, Collection, Product } from "@/lib/data/types";
import type { ProductOption, ProductVariant } from "@/lib/data/variant-types";

interface Props {
  product?: Product;
  categories: Category[];
  brands: Brand[];
  collections: Collection[];
  initialOptions?: ProductOption[];
  initialVariants?: ProductVariant[];
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38", "Free"];
const COLORS = ["Black", "White", "Navy", "Grey", "Brown", "Beige", "Olive", "Red", "Blue", "Green", "Gold"];

interface VariantRow {
  id: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
}

export function ProductForm({ product, categories, brands, collections, initialOptions, initialVariants }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!product;

  // New variant system state
  const [variantOptions, setVariantOptions] = useState<{ name: string; values: string[] }[]>([]);
  const [variantData, setVariantData] = useState<{ combination: Record<string, string>; price_override: number | null; stock: number; sku: string | null }[]>([]);

  const [name, setName] = useState(product?.name ?? "");
  const [basePrice, setBasePrice] = useState(product?.base_price ?? 0);
  const [comparePrice, setComparePrice] = useState(product?.compare_price ?? null);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [categoryId, setCategoryId] = useState(product?.category_id ?? null);
  const [brandId, setBrandId] = useState(product?.brand_id ?? null);
  const [collectionId, setCollectionId] = useState(product?.collection_id ?? null);
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [isHotDeal, setIsHotDeal] = useState(product?.is_hot_deal ?? false);
  const [salesCount, setSalesCount] = useState(product?.sales_count ?? 0);
  const [keywords, setKeywords] = useState<string[]>(product?.keywords ?? []);
  const [keywordInput, setKeywordInput] = useState("");
  const [metaTitle, setMetaTitle] = useState(product?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(product?.meta_description ?? "");
  // Rich text description — store as HTML string
  const [descHtml, setDescHtml] = useState(() => {
    // Check if description has HTML content (from rich text editor)
    if (product?.description?.[0]?.text) {
      const text = product.description[0].text;
      // If it looks like HTML, use it directly
      if (text.startsWith("<")) return text;
      // Otherwise wrap in paragraph tags
      return `<p>${text}</p>`;
    }
    return "";
  });

  const [imgUrl, setImgUrl] = useState("");

  function addImageUrl() {
    if (!imgUrl.trim()) return;
    setImages([...images, imgUrl.trim()]);
    setImgUrl("");
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setImages((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }

  function removeImage(idx: number) {
    setImages(images.filter((_, i) => i !== idx));
  }

  function handleSave() {
    if (!name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (basePrice <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }
    if (images.length === 0) {
      toast.error("At least one image is required");
      return;
    }

    const description = [];
    if (descHtml.trim() && descHtml !== "<p><br></p>") {
      description.push({ type: "paragraph" as const, text: descHtml });
    }

    const totalStock = variantData.length > 0
      ? variantData.reduce((s, v) => s + v.stock, 0)
      : 0;

    startTransition(async () => {
      try {
        let productId: string;
        if (isEditing && product) {
          await updateProduct(product.id, {
            name: name.trim(),
            description,
            base_price: basePrice,
            compare_price: comparePrice,
            stock: totalStock,
            images,
            category_id: categoryId,
            brand_id: brandId,
            collection_id: collectionId,
            is_featured: isFeatured,
            is_hot_deal: isHotDeal,
            sales_count: salesCount,
            keywords,
            meta_title: metaTitle.trim() || null,
            meta_description: metaDescription.trim() || null,
          });
          productId = product.id;
          toast.success("Product updated");
        } else {
          const created = await createProduct({
            name: name.trim(),
            description,
            base_price: basePrice,
            compare_price: comparePrice,
            stock: totalStock,
            images,
            category_id: categoryId,
            brand_id: brandId,
            collection_id: collectionId,
            is_featured: isFeatured,
            is_hot_deal: isHotDeal,
            sales_count: salesCount,
            keywords,
            meta_title: metaTitle.trim() || null,
            meta_description: metaDescription.trim() || null,
          } as Omit<Product, "id" | "created_at">);
          productId = created.id;
          toast.success("Product created");
        }

        // Save options and variants to new tables
        if (variantOptions.length > 0 || variantData.length > 0) {
          await saveProductVariants(productId, variantOptions, variantData);
        }

        router.push("/admin/products");
        router.refresh();
      } catch (err) {
        toast.error("Failed to save product", {
          description: err instanceof Error ? err.message : "Unknown error",
        });
      }
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/products"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {isEditing ? "Edit Product" : "New Product"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEditing ? "Update product details" : "Create a new product for your store"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/products">Cancel</Link>
          </Button>
          <Button onClick={handleSave} disabled={isPending} className="gap-2">
            <Save className="h-4 w-4" /> {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-base font-semibold">General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Name *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bangladesh Home Jersey 2026" />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Description</Label>
                <RichTextEditor
                  value={descHtml}
                  onChange={setDescHtml}
                  placeholder="Write product description with formatting..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5 block text-xs uppercase tracking-wider">Base Price (taka) *</Label>
                  <Input type="number" value={basePrice} onChange={(e) => setBasePrice(+e.target.value)} />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs uppercase tracking-wider">Compare Price</Label>
                  <Input type="number" value={comparePrice ?? ""} onChange={(e) => setComparePrice(e.target.value ? +e.target.value : null)} placeholder="Optional" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New Variant Generator */}
          <VariantGenerator
            productId={product?.id}
            initialOptions={initialOptions}
            initialVariants={initialVariants}
            onChange={(opts, vars) => {
              setVariantOptions(opts);
              setVariantData(vars);
            }}
          />

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-base font-semibold">Images</CardTitle>
              <CardDescription>First image is the main display image</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-8 transition hover:border-primary/40 hover:bg-muted/30">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm font-medium">Click to upload images</span>
                <input type="file" accept="image/*" multiple className="sr-only" onChange={handleImageUpload} />
              </label>
              <div className="flex gap-2">
                <Input value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} placeholder="https://example.com/image.jpg" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImageUrl())} />
                <Button onClick={addImageUrl} variant="outline" size="sm">Add URL</Button>
              </div>
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((url, idx) => (
                    <div key={idx} className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                      { }
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      {idx === 0 && <Badge className="absolute left-1 top-1 text-[9px]">Main</Badge>}
                      <button onClick={() => removeImage(idx)} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 backdrop-blur transition hover:bg-destructive hover:text-destructive-foreground">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="font-heading text-base font-semibold">Organization</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Category</Label>
                <Select value={categoryId ?? ""} onValueChange={setCategoryId}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Brand</Label>
                <Select value={brandId ?? ""} onValueChange={setBrandId}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>{brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Collection</Label>
                <Select value={collectionId ?? ""} onValueChange={setCollectionId}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>{collections.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-heading text-base font-semibold">Visibility</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div><Label className="text-sm font-medium">Featured Product</Label><p className="text-xs text-muted-foreground">Show in Featured section</p></div>
                <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div><Label className="text-sm font-medium">Hot Deal</Label><p className="text-xs text-muted-foreground">Show in Hot Deals section</p></div>
                <Switch checked={isHotDeal} onCheckedChange={setIsHotDeal} />
              </div>
              <Separator />
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Sales Count</Label>
                <Input type="number" value={salesCount} onChange={(e) => setSalesCount(+e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* SEO Card */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-base font-semibold">SEO Settings</CardTitle>
              <CardDescription>Optimize for search engines. Keywords help products appear in search results.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Keywords */}
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Search Keywords</Label>
                <div className="flex gap-2">
                  <Input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        const val = keywordInput.trim();
                        if (val && !keywords.includes(val)) {
                          setKeywords([...keywords, val]);
                        }
                        setKeywordInput("");
                      } else if (e.key === "Backspace" && !keywordInput && keywords.length > 0) {
                        setKeywords(keywords.slice(0, -1));
                      }
                    }}
                    placeholder="Type a keyword and press Enter"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const val = keywordInput.trim();
                      if (val && !keywords.includes(val)) {
                        setKeywords([...keywords, val]);
                      }
                      setKeywordInput("");
                    }}
                  >
                    Add
                  </Button>
                </div>
                {keywords.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {keywords.map((kw, i) => (
                      <span key={i} className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium">
                        {kw}
                        <button
                          type="button"
                          onClick={() => setKeywords(keywords.filter((_, idx) => idx !== i))}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="mt-1 text-xs text-muted-foreground">Add words customers might search for (e.g. "jersey", "world cup", "men", "sports"). Press Enter or comma to add.</p>
              </div>

              {/* Meta Title */}
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Meta Title (optional)</Label>
                <Input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Custom title for search engines (defaults to product name)"
                  maxLength={60}
                />
                <p className="mt-1 text-xs text-muted-foreground">{metaTitle.length}/60 characters</p>
              </div>

              {/* Meta Description */}
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Meta Description (optional)</Label>
                <Textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={2}
                  placeholder="Short description for search results (defaults to product description)"
                  maxLength={160}
                />
                <p className="mt-1 text-xs text-muted-foreground">{metaDescription.length}/160 characters</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
