"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, Globe, Upload, X, Loader2,
  Shirt, Trophy, Dumbbell, User, Users, Gamepad2, Palette, Layers, Sparkles, Tag,
  Crown, Star, Heart, ShoppingBag, Footprints, Watch, Glasses, Baby, Backpack,
  Gift, Umbrella, Home, Coffee, Music, Camera, BookOpen, Briefcase, Anchor,
  Flame, Snowflake, Sun, Moon, Leaf, Wind, Gem, Brush, Scissors,
  Headphones, Speaker, Smartphone, Laptop, Tv, Gamepad, Puzzle, Blocks,
  Car, Plane, Bike, Bus, Ship, Rocket, Train, Truck,
  Dog, Cat, Fish, Bird, Rabbit, Turtle, Bug,
  Flower, Trees, Mountain, Waves, Cloud, Rainbow, Zap, Battery,
  PenTool, PaintBucket, Eraser, Ruler, Hammer, Wrench, Cog,
  Pizza, IceCream, Apple, Carrot, Cookie, Cake, Wine, Beer,
  Stethoscope, Pill, HeartPulse, Cross, Shield, Sword, Axe,
  Map, Compass, Flag, Globe2, MountainSnow, Tent, Binoculars,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { slugify } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Category, Brand, Collection } from "@/lib/data/types";

/** All selectable icons (name → component) */
const ICON_OPTIONS: { name: string; Icon: any }[] = [
  { name: "shirt", Icon: Shirt },
  { name: "trophy", Icon: Trophy },
  { name: "dumbbell", Icon: Dumbbell },
  { name: "user", Icon: User },
  { name: "users", Icon: Users },
  { name: "gamepad", Icon: Gamepad2 },
  { name: "palette", Icon: Palette },
  { name: "layers", Icon: Layers },
  { name: "sparkles", Icon: Sparkles },
  { name: "tag", Icon: Tag },
  { name: "crown", Icon: Crown },
  { name: "star", Icon: Star },
  { name: "heart", Icon: Heart },
  { name: "shopping-bag", Icon: ShoppingBag },
  { name: "footprints", Icon: Footprints },
  { name: "watch", Icon: Watch },
  { name: "glasses", Icon: Glasses },
  { name: "baby", Icon: Baby },
  { name: "backpack", Icon: Backpack },
  { name: "gift", Icon: Gift },
  { name: "umbrella", Icon: Umbrella },
  { name: "home", Icon: Home },
  { name: "coffee", Icon: Coffee },
  { name: "music", Icon: Music },
  { name: "camera", Icon: Camera },
  { name: "book", Icon: BookOpen },
  { name: "briefcase", Icon: Briefcase },
  { name: "anchor", Icon: Anchor },
  { name: "flame", Icon: Flame },
  { name: "snowflake", Icon: Snowflake },
  { name: "sun", Icon: Sun },
  { name: "moon", Icon: Moon },
  { name: "leaf", Icon: Leaf },
  { name: "wind", Icon: Wind },
  { name: "gem", Icon: Gem },
  { name: "brush", Icon: Brush },
  { name: "scissors", Icon: Scissors },
  // Fashion & Accessories
  { name: "headphones", Icon: Headphones },
  { name: "speaker", Icon: Speaker },
  { name: "smartphone", Icon: Smartphone },
  { name: "laptop", Icon: Laptop },
  { name: "tv", Icon: Tv },
  { name: "gamepad2", Icon: Gamepad },
  { name: "puzzle", Icon: Puzzle },
  { name: "blocks", Icon: Blocks },
  // Vehicles
  { name: "car", Icon: Car },
  { name: "plane", Icon: Plane },
  { name: "bike", Icon: Bike },
  { name: "bus", Icon: Bus },
  { name: "ship", Icon: Ship },
  { name: "rocket", Icon: Rocket },
  { name: "train", Icon: Train },
  { name: "truck", Icon: Truck },
  // Animals
  { name: "dog", Icon: Dog },
  { name: "cat", Icon: Cat },
  { name: "fish", Icon: Fish },
  { name: "bird", Icon: Bird },
  { name: "rabbit", Icon: Rabbit },
  { name: "turtle", Icon: Turtle },
  { name: "bug", Icon: Bug },
  // Nature
  { name: "flower", Icon: Flower },
  { name: "trees", Icon: Trees },
  { name: "mountain", Icon: Mountain },
  { name: "waves", Icon: Waves },
  { name: "cloud", Icon: Cloud },
  { name: "rainbow", Icon: Rainbow },
  { name: "zap", Icon: Zap },
  { name: "battery", Icon: Battery },
  // Tools & Craft
  { name: "pentool", Icon: PenTool },
  { name: "paintbucket", Icon: PaintBucket },
  { name: "eraser", Icon: Eraser },
  { name: "ruler", Icon: Ruler },
  { name: "hammer", Icon: Hammer },
  { name: "wrench", Icon: Wrench },
  { name: "cog", Icon: Cog },
  // Food & Drink
  { name: "pizza", Icon: Pizza },
  { name: "icecream", Icon: IceCream },
  { name: "apple", Icon: Apple },
  { name: "carrot", Icon: Carrot },
  { name: "cookie", Icon: Cookie },
  { name: "cake", Icon: Cake },
  { name: "wine", Icon: Wine },
  { name: "beer", Icon: Beer },
  // Medical
  { name: "stethoscope", Icon: Stethoscope },
  { name: "pill", Icon: Pill },
  { name: "heartpulse", Icon: HeartPulse },
  // Symbols
  { name: "cross", Icon: Cross },
  { name: "shield", Icon: Shield },
  { name: "sword", Icon: Sword },
  { name: "axe", Icon: Axe },
  // Outdoor & Travel
  { name: "map", Icon: Map },
  { name: "compass", Icon: Compass },
  { name: "flag", Icon: Flag },
  { name: "globe2", Icon: Globe2 },
  { name: "mountain-snow", Icon: MountainSnow },
  { name: "tent", Icon: Tent },
  { name: "binoculars", Icon: Binoculars },
];

/** Get icon component by name (fallback to Tag) */
export function getIconByName(name: string | null | undefined): any {
  if (!name) return Tag;
  const found = ICON_OPTIONS.find((o) => o.name === name);
  return found ? found.Icon : Tag;
}

interface Props {
  categories: Category[];
  brands: Brand[];
  collections: Collection[];
  actions: {
    createTaxonomy: (type: "categories" | "brands" | "collections", item: any) => Promise<void>;
    updateTaxonomy: (type: "categories" | "brands" | "collections", id: string, item: any) => Promise<void>;
    deleteTaxonomy: (type: "categories" | "brands" | "collections", id: string) => Promise<void>;
  };
}

type TaxonomyType = "categories" | "brands" | "collections";

interface TaxonomyItem {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  icon: string | null;
  description: string | null;
}

export function TaxonomyManager({ categories, brands, collections, actions }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingType, setEditingType] = useState<TaxonomyType | null>(null);
  const [editing, setEditing] = useState<TaxonomyItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: TaxonomyType; item: TaxonomyItem } | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", image: "", icon: "", description: "" });
  const [iconSearch, setIconSearch] = useState("");

  function openCreate(type: TaxonomyType) {
    setEditingType(type);
    setEditing(null);
    setForm({ name: "", slug: "", image: "", icon: "", description: "" });
    setIconSearch("");
    setShowForm(true);
  }

  function openEdit(type: TaxonomyType, item: TaxonomyItem) {
    setEditingType(type);
    setEditing(item);
    setForm({ name: item.name, slug: item.slug, image: item.image ?? "", icon: item.icon ?? "", description: item.description ?? "" });
    setIconSearch("");
    setShowForm(true);
  }

  const [uploadingImage, setUploadingImage] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image too large (max 5MB)"); return; }
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", editingType || "misc");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.url) { toast.error("Upload failed", { description: data.error }); return; }
      setForm((f) => ({ ...f, image: data.url }));
      toast.success("Image uploaded");
    } catch { toast.error("Upload failed"); }
    finally { setUploadingImage(false); }
  }

  function save() {
    if (!form.name.trim() || !editingType) {
      toast.error("Name is required");
      return;
    }
    const slug = form.slug.trim() ? slugify(form.slug) : slugify(form.name);
    const item = {
      name: form.name.trim(),
      slug,
      image: form.image.trim() || null,
      icon: form.icon || null,
      description: form.description.trim() || null,
    };

    startTransition(async () => {
      try {
        if (editing) {
          await actions.updateTaxonomy(editingType, editing.id, item);
          toast.success(`${editingType.slice(0, -1)} updated`);
        } else {
          await actions.createTaxonomy(editingType, item);
          toast.success(`${editingType.slice(0, -1)} created`);
        }
        setShowForm(false);
        setEditing(null);
        setEditingType(null);
        router.refresh();
      } catch (err) {
        toast.error("Failed to save", {
          description: err instanceof Error ? err.message : "Unknown error",
        });
      }
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      try {
        await actions.deleteTaxonomy(deleteTarget.type, deleteTarget.item.id);
        toast.success(`${deleteTarget.type.slice(0, -1)} deleted`);
        setDeleteTarget(null);
        router.refresh();
      } catch {
        toast.error("Failed to delete");
      }
    });
  }

  // Filter icons by search
  const filteredIcons = ICON_OPTIONS.filter((o) =>
    !iconSearch.trim() || o.name.includes(iconSearch.toLowerCase())
  );

  const isCategory = editingType === "categories";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">Taxonomies</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage categories, brands, and collections for your products.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <TaxonomyColumn title="Categories" type="categories" items={categories as any} onCreate={() => openCreate("categories")} onEdit={(item) => openEdit("categories", item)} onDelete={(item) => setDeleteTarget({ type: "categories", item })} />
        <TaxonomyColumn title="Brands" type="brands" items={brands as any} onCreate={() => openCreate("brands")} onEdit={(item) => openEdit("brands", item)} onDelete={(item) => setDeleteTarget({ type: "brands", item })} />
        <TaxonomyColumn title="Collections" type="collections" items={collections as any} onCreate={() => openCreate("collections")} onEdit={(item) => openEdit("collections", item)} onDelete={(item) => setDeleteTarget({ type: "collections", item })} />
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-h-[92vh] max-w-md gap-0 overflow-hidden p-0">
          <DialogHeader className="shrink-0 border-b px-6 pt-6 pb-4">
            <DialogTitle className="font-heading text-xl font-semibold">
              {editing ? `Edit ${editingType?.slice(0, -1)}` : `New ${editingType?.slice(0, -1)}`}
            </DialogTitle>
            <DialogDescription>
              {editing ? `Update the ${editingType?.slice(0, -1)} details below.` : `Create a new ${editingType?.slice(0, -1)}.`}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(92vh-180px)]">
            <div className="space-y-4 px-6 py-5">
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : slugify(e.target.value) })}
                  placeholder="e.g. Premium Jerseys"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" className="font-mono text-sm" />
              </div>

              {/* Icon picker — only for categories */}
              {isCategory && (
                <div>
                  <Label className="mb-1.5 block text-xs uppercase tracking-wider">Icon</Label>
                  <p className="mb-2 text-xs text-muted-foreground">Choose an icon for this category (shown on the homepage).</p>
                  {/* Selected icon preview */}
                  {form.icon && (
                    <div className="mb-2 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium">
                        {(() => { const I = getIconByName(form.icon); return <I className="h-4 w-4" />; })()}
                        {form.icon}
                        <button type="button" onClick={() => setForm({ ...form, icon: "" })} className="ml-1 text-muted-foreground hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    </div>
                  )}
                  {/* Icon search */}
                  <Input
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                    placeholder="Search icons..."
                    className="mb-2 h-8 text-xs"
                  />
                  {/* Icon grid */}
                  <ScrollArea className="h-40 rounded-lg border border-border">
                    <div className="grid grid-cols-8 gap-1.5 p-2">
                    {filteredIcons.map(({ name, Icon }) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setForm({ ...form, icon: name })}
                        className={cn(
                          "flex aspect-square items-center justify-center rounded-md border transition-all",
                          form.icon === name
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-transparent hover:border-border hover:bg-accent"
                        )}
                        title={name}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Image upload — for brands/collections (categories use icons) */}
              {!isCategory && (
                <div>
                  <Label className="mb-1.5 block text-xs uppercase tracking-wider">Image</Label>
                  {form.image ? (
                    <div className="relative h-32 w-full overflow-hidden rounded-lg border border-border bg-muted">
                      <img src={form.image} alt="Preview" className="h-full w-full object-cover" />
                      <button type="button" onClick={() => setForm({ ...form, image: "" })} className="absolute right-2 top-2 rounded-full bg-background/90 p-1 shadow-sm hover:bg-background hover:text-destructive" title="Remove image">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-muted-foreground transition hover:border-foreground hover:text-foreground">
                      {uploadingImage ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                      <span className="text-xs">{uploadingImage ? "Uploading..." : "Click to upload image"}</span>
                      <span className="text-[10px]">PNG, JPG, WebP — max 5MB</span>
                      <input type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} disabled={uploadingImage} />
                    </label>
                  )}
                </div>
              )}

              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Short description..." />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="shrink-0 border-t px-6 py-4">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={save} disabled={isPending}>{isPending ? "Saving..." : editing ? "Save Changes" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.type.slice(0, -1)}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteTarget?.item.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isPending}>
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function TaxonomyColumn({ title, type, items, onCreate, onEdit, onDelete }: { title: string; type: string; items: TaxonomyItem[]; onCreate: () => void; onEdit: (item: TaxonomyItem) => void; onDelete: (item: TaxonomyItem) => void }) {
  return <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3"><div><CardTitle className="text-base font-semibold">{title}</CardTitle><p className="mt-0.5 text-xs text-muted-foreground">{items.length} items</p></div><Button onClick={onCreate} size="sm" variant="outline" className="gap-1.5"><Plus className="h-3.5 w-3.5" />Add</Button></CardHeader><CardContent className="space-y-2">{items.length===0?<div className="rounded-lg border border-dashed py-8 text-center"><Globe className="mx-auto h-6 w-6 text-muted-foreground" /><p className="mt-2 text-sm text-muted-foreground">No items yet</p></div>:items.map(item=><div key={item.id} className="flex items-center gap-3 rounded-lg border p-2.5">{type==="categories"&&item.icon?(()=>{const I=getIconByName(item.icon);return<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10"><I className="h-5 w-5 text-primary" /></div>;})():item.image?<div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted"><img src={item.image} alt="" className="h-full w-full object-cover" /></div>:<div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted"><Globe className="h-4 w-4 text-muted-foreground" /></div>}<div className="min-w-0 flex-1"><p className="line-clamp-1 text-sm font-medium">{item.name}</p><p className="text-xs text-muted-foreground font-mono">/{item.slug}</p></div><Button onClick={()=>onEdit(item)} variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-3.5 w-3.5" /></Button><Button onClick={()=>onDelete(item)} variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button></div>)}</CardContent></Card>;
}
