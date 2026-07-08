"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, X, Upload, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import type { Category, Brand, Collection, Product, Variant } from "@/lib/data/types";

interface Props {
  product: Product | null;
  categories: Category[];
  brands: Brand[];
  collections: Collection[];
  onClose: () => void;
  onSave: (p: Product) => void;
}

interface VariantRow {
  id: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38", "Free"];
const COLORS = ["Black", "White", "Navy", "Grey", "Brown", "Beige", "Olive", "Red", "Blue", "Green", "Gold"];

export function ProductFormDialog({
  product, categories, brands, collections, onClose, onSave,
}: Props) {
  const [form, setForm] = useState<Product>(
    product ?? {
      id: `prod-${Date.now()}`,
      name: "",
      description: [],
      base_price: 0,
      compare_price: null,
      variants: null,
      stock: 0,
      images: [],
      category_id: null,
      brand_id: null,
      collection_id: null,
      is_featured: false,
      is_hot_deal: false,
      sales_count: 0,
      created_at: new Date().toISOString(),
    },
  );

  const [descText, setDescText] = useState(form.description?.[0]?.text ?? "");
  const [descBullets, setDescBullets] = useState((form.description?.[1] as any)?.items?.join("\n") ?? "");
  const [imgUrl, setImgUrl] = useState("");
  const [variants, setVariants] = useState<VariantRow[]>(
    (form.variants ?? []).map((v, i) => ({
      id: `v-${i}`,
      size: v.size ?? "",
      color: v.color ?? "",
      stock: v.stock ?? 0,
      sku: v.sku ?? "",
    }))
  );

  function update(patch: Partial<Product>) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function addImageUrl() {
    if (!imgUrl.trim()) return;
    update({ images: [...form.images, imgUrl.trim()] });
    setImgUrl("");
  }

  function removeImage(idx: number) {
    update({ images: form.images.filter((_, i) => i !== idx) });
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setForm((f) => ({ ...f, images: [...f.images, reader.result as string] }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }

  function addVariant() {
    setVariants([...variants, { id: `v-${Date.now()}`, size: "", color: "", stock: 0, sku: "" }]);
  }

  function removeVariant(id: string) {
    setVariants(variants.filter((v) => v.id !== id));
  }

  function updateVariant(id: string, patch: Partial<VariantRow>) {
    setVariants(variants.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }

  function generateVariants() {
    // Generate all combinations of selected sizes × colors
    const commonSizes = SIZES.slice(0, 4);
    const newVariants: VariantRow[] = [];
    commonSizes.forEach((size) => {
      newVariants.push({
        id: `v-${Date.now()}-${size}`,
        size,
        color: "",
        stock: 10,
        sku: `${form.name.slice(0, 3).toUpperCase()}-${size}`,
      });
    });
    setVariants(newVariants);
    toast.success(`Generated ${newVariants.length} variants`);
  }

  function handleSave() {
    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (form.base_price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }
    if (form.images.length === 0) {
      toast.error("At least one image is required");
      return;
    }

    const description = [];
    if (descText.trim()) description.push({ type: "paragraph" as const, text: descText.trim() });
    if (descBullets.trim()) {
      description.push({
        type: "list" as const,
        items: descBullets.split("\n").filter(Boolean),
      });
    }

    const finalVariants: Variant[] | null =
      variants.length > 0
        ? variants.map((v) => ({
            size: v.size || undefined,
            color: v.color || undefined,
            stock: v.stock,
            sku: v.sku || undefined,
          }))
        : null;

    const totalStock = finalVariants
      ? finalVariants.reduce((s, v) => s + v.stock, 0)
      : form.stock;

    onSave({
      ...form,
      description,
      variants: finalVariants,
      stock: totalStock,
    });
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="font-heading text-xl font-semibold">
            {product ? "Edit Product" : "New Product"}
          </DialogTitle>
          <DialogDescription>
            Fill out the form below. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="flex-1 overflow-visible">
          <div className="px-6 pb-2">
            <TabsList className="w-full">
              <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
              <TabsTrigger value="images" className="flex-1">Images</TabsTrigger>
              <TabsTrigger value="variants" className="flex-1">Variants</TabsTrigger>
              <TabsTrigger value="organization" className="flex-1">Organization</TabsTrigger>
            </TabsList>
          </div>

          <div className="max-h-[calc(92vh-180px)] overflow-y-auto px-6 pb-32">
            <TabsContent value="general" className="space-y-4 pb-6">
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => update({ name: e.target.value })}
                  placeholder="e.g. Bangladesh Home Jersey 2026"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5 block text-xs uppercase tracking-wider">Base Price (taka) *</Label>
                  <Input
                    type="number"
                    value={form.base_price}
                    onChange={(e) => update({ base_price: +e.target.value })}
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs uppercase tracking-wider">Compare Price</Label>
                  <Input
                    type="number"
                    value={form.compare_price ?? ""}
                    onChange={(e) => update({ compare_price: e.target.value ? +e.target.value : null })}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Description</Label>
                <Textarea
                  value={descText}
                  onChange={(e) => setDescText(e.target.value)}
                  rows={3}
                  placeholder="Main product description..."
                />
              </div>

              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Features (one per line)</Label>
                <Textarea
                  value={descBullets}
                  onChange={(e) => setDescBullets(e.target.value)}
                  rows={4}
                  placeholder={"Dri-FIT moisture management\nRecycled polyester fabric\nEmbroidered crest"}
                />
              </div>

              <Separator />

              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={form.is_featured}
                    onCheckedChange={(v) => update({ is_featured: v })}
                  />
                  Featured Product
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={form.is_hot_deal}
                    onCheckedChange={(v) => update({ is_hot_deal: v })}
                  />
                  Hot Deal
                </label>
              </div>
            </TabsContent>

            <TabsContent value="images" className="space-y-4 pb-6">
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Product Images</Label>
                <p className="mb-3 text-xs text-muted-foreground">
                  Upload from your device or add image URLs. First image will be the main display image.
                </p>

                {/* Upload zone */}
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-8 transition hover:border-primary/40 hover:bg-muted/30">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm font-medium">Click to upload images</span>
                  <span className="text-xs text-muted-foreground">PNG, JPG, WebP up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={handleImageUpload}
                  />
                </label>

                {/* URL input */}
                <div className="mt-3 flex gap-2">
                  <Input
                    value={imgUrl}
                    onChange={(e) => setImgUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImageUrl())}
                  />
                  <Button onClick={addImageUrl} variant="outline" size="sm">Add URL</Button>
                </div>

                {/* Image grid */}
                {form.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {form.images.map((url, idx) => (
                      <div key={idx} className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                        { }
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        {idx === 0 && (
                          <Badge className="absolute left-1 top-1 text-[9px]">Main</Badge>
                        )}
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 backdrop-blur transition hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="variants" className="space-y-4 pb-6">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <Label className="text-xs uppercase tracking-wider">Product Variants</Label>
                    <p className="text-xs text-muted-foreground">
                      Add size/color combinations. Stock will be calculated automatically.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={generateVariants} variant="outline" size="sm">
                      Auto-generate
                    </Button>
                    <Button onClick={addVariant} variant="outline" size="sm" className="gap-1">
                      <Plus className="h-3.5 w-3.5" /> Add
                    </Button>
                  </div>
                </div>

                {variants.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border py-10 text-center">
                    <p className="text-sm text-muted-foreground">No variants yet.</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Products without variants use the stock field directly.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="grid grid-cols-[2fr_2fr_1fr_2fr_28px] gap-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <span>Size</span>
                      <span>Color</span>
                      <span>Stock</span>
                      <span>SKU</span>
                      <span />
                    </div>
                    {variants.map((v) => (
                      <div key={v.id} className="grid grid-cols-[2fr_2fr_1fr_2fr_28px] gap-2">
                        <Select value={v.size} onValueChange={(val) => updateVariant(v.id, { size: val })}>
                          <SelectTrigger className="h-9"><SelectValue placeholder="—" /></SelectTrigger>
                          <SelectContent>
                            {SIZES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Select value={v.color} onValueChange={(val) => updateVariant(v.id, { color: val })}>
                          <SelectTrigger className="h-9"><SelectValue placeholder="—" /></SelectTrigger>
                          <SelectContent>
                            {COLORS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          value={v.stock}
                          onChange={(e) => updateVariant(v.id, { stock: +e.target.value })}
                          className="h-9"
                        />
                        <Input
                          value={v.sku}
                          onChange={(e) => updateVariant(v.id, { sku: e.target.value })}
                          className="h-9"
                          placeholder="SKU"
                        />
                        <Button
                          onClick={() => removeVariant(v.id)}
                          variant="ghost"
                          size="icon"
                          className="h-9 w-7 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {variants.length > 0 && (
                  <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
                    <span className="text-muted-foreground">Total stock from variants:</span>
                    <span className="font-semibold">
                      {variants.reduce((s, v) => s + v.stock, 0)} units
                    </span>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="organization" className="space-y-4 pb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5 block text-xs uppercase tracking-wider">Category</Label>
                  <Select
                    value={form.category_id ?? ""}
                    onValueChange={(v) => update({ category_id: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs uppercase tracking-wider">Brand</Label>
                  <Select
                    value={form.brand_id ?? ""}
                    onValueChange={(v) => update({ brand_id: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      {brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Collection</Label>
                <Select
                  value={form.collection_id ?? ""}
                  onValueChange={(v) => update({ collection_id: v })}
                >
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    {collections.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {variants.length === 0 && (
                <div>
                  <Label className="mb-1.5 block text-xs uppercase tracking-wider">Stock Quantity</Label>
                  <Input
                    type="number"
                    value={form.stock}
                    onChange={(e) => update({ stock: +e.target.value })}
                  />
                </div>
              )}

              <Separator />

              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Sales Count (manual)</Label>
                <Input
                  type="number"
                  value={form.sales_count}
                  onChange={(e) => update({ sales_count: +e.target.value })}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Used for trending sort. Usually incremented automatically on order.
                </p>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-border bg-muted/30 px-6 py-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Product</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
