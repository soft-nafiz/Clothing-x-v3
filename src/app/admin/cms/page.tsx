"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Megaphone, Image as ImageIcon, Plus, X, Save, Upload, Home,
  ShoppingBag, Bell, Type, Layout, MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";

interface HeroSlide {
  title: string;
  subtitle: string;
  cta: string;
  image: string;
  href: string;
}

interface CMSData {
  announcement: string;
  announcementActive: boolean;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButtonText: string;
  ctaImage: string;
  heroSlides: HeroSlide[];
  // Home sections
  homeFeaturedTitle: string;
  homeHotDealsTitle: string;
  homeNewArrivalsTitle: string;
  homeTrendingTitle: string;
  // Footer
  footerTagline: string;
  footerPhone: string;
  footerEmail: string;
  footerAddress: string;
  // About
  aboutTitle: string;
  aboutSubtitle: string;
  aboutMission: string;
  // Chat links (floating chat widget)
  chatLinks: {
    messenger: string;
    whatsapp: string;
    instagram: string;
  };
}

const DEFAULT_DATA: CMSData = {
  announcement: "Free delivery inside Dhaka on orders over 5,000 taka — COD nationwide across 64 districts",
  announcementActive: true,
  ctaTitle: "Members get more.",
  ctaSubtitle: "Sign up for early access to drops, agent pricing and exclusive collections. Cash on delivery across all 64 districts.",
  ctaButtonText: "Create Account",
  ctaImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80",
  heroSlides: [
    {
      title: "WORLD CUP 2026",
      subtitle: "Official jerseys. Engineered for champions.",
      cta: "Shop the Drop",
      image: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1600&q=80",
      href: "/categories/fifa-2026-jersey",
    },
    {
      title: "PERFORMANCE UNLEASHED",
      subtitle: "Premium apparel built for the modern athlete.",
      cta: "Explore Sports",
      image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1600&q=80",
      href: "/categories/sports",
    },
    {
      title: "THE GOLD STANDARD",
      subtitle: "Luxury essentials. Deliberately crafted.",
      cta: "Shop Men",
      image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1600&q=80",
      href: "/categories/men",
    },
  ],
  homeFeaturedTitle: "Featured Products",
  homeHotDealsTitle: "Hot Deals",
  homeNewArrivalsTitle: "New Arrivals",
  homeTrendingTitle: "Trending Now",
  footerTagline: "Premium essentials and luxury apparel, deliberately crafted. Cash on delivery across all 64 districts of Bangladesh.",
  footerPhone: "+880 1700 000000",
  footerEmail: "hello@clothingx.com",
  footerAddress: "Gulshan, Dhaka 1212, Bangladesh",
  aboutTitle: "Deliberately crafted. Delivered with trust.",
  aboutSubtitle: "CLOTHING X was founded in Dhaka with a single conviction — that premium apparel should be accessible to every Bangladeshi, with the trust of cash-on-delivery and the polish of a global brand.",
  aboutMission: "We exist to close the gap between global fashion standards and local shopping realities. We bring the polish of a Shopify-grade storefront and pair it with the trust of cash-on-delivery, verified agent pricing, and a no-questions-asked refund portal.",
  chatLinks: { messenger: "", whatsapp: "", instagram: "" },
};

export default function AdminCmsPage() {
  const [data, setData] = useState<CMSData>(DEFAULT_DATA);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch CMS content from Supabase
    fetch("/api/cms")
      .then((r) => r.json())
      .then((result) => {
        if (result.data) {
          setData({
            ...DEFAULT_DATA,
            ...result.data,
            chatLinks: { ...DEFAULT_DATA.chatLinks, ...(result.data.chatLinks || {}) },
          });
        }
      })
      .catch(() => { /* use defaults */ });
  }, []);

  function update<K extends keyof CMSData>(key: K, value: CMSData[K]) {
    setData((d) => ({ ...d, [key]: value }));
    setDirty(true);
  }

  function updateChatLink(key: "messenger" | "whatsapp" | "instagram", value: string) {
    setData((d) => ({ ...d, chatLinks: { ...d.chatLinks, [key]: value } }));
    setDirty(true);
  }

  async function saveAll() {
    setSaving(true);
    try {
      const res = await fetch("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        toast.error("Failed to save CMS content");
        setSaving(false);
        return;
      }
      setDirty(false);
      setSaving(false);
      toast.success("CMS content saved", {
        description: "The live storefront will reflect these changes.",
      });
    } catch {
      toast.error("Failed to save CMS content");
      setSaving(false);
    }
  }

  function handleImageUpload(field: "ctaImage" | `heroSlide_${number}_image`) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (field.startsWith("heroSlide_")) {
          const idx = parseInt(field.split("_")[1]);
          const slides = [...data.heroSlides];
          slides[idx] = { ...slides[idx], image: reader.result as string };
          update("heroSlides", slides);
        } else {
          update(field, reader.result as string);
        }
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    };
  }

  function addSlide() {
    update("heroSlides", [
      ...data.heroSlides,
      { title: "NEW SLIDE", subtitle: "Subtitle here", cta: "Shop Now", image: "", href: "/shop" },
    ]);
    setDirty(true);
  }

  function updateSlide(idx: number, patch: Partial<HeroSlide>) {
    const slides = data.heroSlides.map((s, i) => (i === idx ? { ...s, ...patch } : s));
    update("heroSlides", slides);
  }

  function removeSlide(idx: number) {
    update("heroSlides", data.heroSlides.filter((_, i) => i !== idx));
    setDirty(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">CMS</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Edit live storefront content — changes apply across all pages.
          </p>
        </div>
        <Button onClick={saveAll} className="gap-2" disabled={!dirty}>
          <Save className="h-4 w-4" /> {dirty ? "Save Changes" : "All Saved"}
        </Button>
      </div>

      {dirty && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-500">
          You have unsaved changes. Click &quot;Save Changes&quot; to publish them to the live store.
        </div>
      )}

      <Tabs defaultValue="announcement">
        <TabsList className="flex h-auto flex-wrap gap-1">
          <TabsTrigger value="announcement" className="gap-1.5">
            <Bell className="h-3.5 w-3.5" /> Announcement
          </TabsTrigger>
          <TabsTrigger value="hero" className="gap-1.5">
            <Home className="h-3.5 w-3.5" /> Hero Slides
          </TabsTrigger>
          <TabsTrigger value="sections" className="gap-1.5">
            <Layout className="h-3.5 w-3.5" /> Home Sections
          </TabsTrigger>
          <TabsTrigger value="cta" className="gap-1.5">
            <Megaphone className="h-3.5 w-3.5" /> CTA Banner
          </TabsTrigger>
          <TabsTrigger value="footer" className="gap-1.5">
            <Type className="h-3.5 w-3.5" /> Footer
          </TabsTrigger>
          <TabsTrigger value="about" className="gap-1.5">
            <ShoppingBag className="h-3.5 w-3.5" /> About Page
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-1.5">
            <MessageCircle className="h-3.5 w-3.5" /> Floating Chat
          </TabsTrigger>
        </TabsList>

        {/* Announcement Bar */}
        <TabsContent value="announcement" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-base font-semibold">Announcement Bar</CardTitle>
              <CardDescription>The thin strip shown at the very top of every page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Show announcement bar</Label>
                <Switch
                  checked={data.announcementActive}
                  onCheckedChange={(v) => update("announcementActive", v)}
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Message</Label>
                <Textarea
                  value={data.announcement}
                  onChange={(e) => update("announcement", e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hero Slides */}
        <TabsContent value="hero" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-semibold">Hero Slider</h2>
              <p className="text-sm text-muted-foreground">
                {data.heroSlides.length} slide{data.heroSlides.length !== 1 && "s"} · shown on homepage
              </p>
            </div>
            <Button onClick={addSlide} variant="outline" size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add Slide
            </Button>
          </div>

          {data.heroSlides.map((slide, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                    {slide.image ? (
                       
                      <img src={slide.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <CardTitle className="font-heading text-sm font-semibold">Slide {i + 1}</CardTitle>
                    <CardDescription className="text-xs">{slide.title || "Untitled"}</CardDescription>
                  </div>
                </div>
                <Button
                  onClick={() => removeSlide(i)}
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <Separator />
              <CardContent className="grid gap-4 pt-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block text-xs uppercase tracking-wider">Title</Label>
                  <Input
                    value={slide.title}
                    onChange={(e) => updateSlide(i, { title: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs uppercase tracking-wider">CTA Button Text</Label>
                  <Input
                    value={slide.cta}
                    onChange={(e) => updateSlide(i, { cta: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs uppercase tracking-wider">Subtitle</Label>
                  <Input
                    value={slide.subtitle}
                    onChange={(e) => updateSlide(i, { subtitle: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs uppercase tracking-wider">Link URL</Label>
                  <Input
                    value={slide.href}
                    onChange={(e) => updateSlide(i, { href: e.target.value })}
                    className="font-mono text-sm"
                    placeholder="/categories/fifa-2026-jersey"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="mb-1.5 block text-xs uppercase tracking-wider">Banner Image</Label>
                  <div className="flex items-center gap-3">
                    {slide.image && (
                      <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                        { }
                        <img src={slide.image} alt="" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <label className="flex-1 cursor-pointer">
                      <span className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-border px-4 py-2.5 text-sm text-muted-foreground transition hover:border-foreground hover:text-foreground">
                        <Upload className="h-4 w-4" /> Upload banner image
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageUpload(`heroSlide_${i}_image`)}
                      />
                    </label>
                    {slide.image && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateSlide(i, { image: "" })}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Home Section Titles */}
        <TabsContent value="sections" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-base font-semibold">Home Section Titles</CardTitle>
              <CardDescription>Customize the headings for each product row on the homepage</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Featured Products Title</Label>
                <Input
                  value={data.homeFeaturedTitle}
                  onChange={(e) => update("homeFeaturedTitle", e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Hot Deals Title</Label>
                <Input
                  value={data.homeHotDealsTitle}
                  onChange={(e) => update("homeHotDealsTitle", e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">New Arrivals Title</Label>
                <Input
                  value={data.homeNewArrivalsTitle}
                  onChange={(e) => update("homeNewArrivalsTitle", e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Trending Title</Label>
                <Input
                  value={data.homeTrendingTitle}
                  onChange={(e) => update("homeTrendingTitle", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CTA Banner */}
        <TabsContent value="cta" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-base font-semibold">CTA Banner</CardTitle>
              <CardDescription>The marketing banner shown near the bottom of the homepage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Title</Label>
                <Input
                  value={data.ctaTitle}
                  onChange={(e) => update("ctaTitle", e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Subtitle</Label>
                <Textarea
                  value={data.ctaSubtitle}
                  onChange={(e) => update("ctaSubtitle", e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Button Text</Label>
                <Input
                  value={data.ctaButtonText}
                  onChange={(e) => update("ctaButtonText", e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Background Image</Label>
                <div className="flex items-center gap-3">
                  {data.ctaImage && (
                    <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                      { }
                      <img src={data.ctaImage} alt="" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <label className="flex-1 cursor-pointer">
                    <span className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-border px-4 py-2.5 text-sm text-muted-foreground transition hover:border-foreground hover:text-foreground">
                      <Upload className="h-4 w-4" /> Upload background
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageUpload("ctaImage")}
                    />
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Footer */}
        <TabsContent value="footer" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-base font-semibold">Footer Content</CardTitle>
              <CardDescription>Shown at the bottom of every page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Brand Tagline</Label>
                <Textarea
                  value={data.footerTagline}
                  onChange={(e) => update("footerTagline", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label className="mb-1.5 block text-xs uppercase tracking-wider">Phone</Label>
                  <Input
                    value={data.footerPhone}
                    onChange={(e) => update("footerPhone", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs uppercase tracking-wider">Email</Label>
                  <Input
                    value={data.footerEmail}
                    onChange={(e) => update("footerEmail", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs uppercase tracking-wider">Address</Label>
                  <Input
                    value={data.footerAddress}
                    onChange={(e) => update("footerAddress", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About Page */}
        <TabsContent value="about" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-base font-semibold">About Page</CardTitle>
              <CardDescription>Content shown on /about</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Main Heading</Label>
                <Input
                  value={data.aboutTitle}
                  onChange={(e) => update("aboutTitle", e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Subtitle</Label>
                <Textarea
                  value={data.aboutSubtitle}
                  onChange={(e) => update("aboutSubtitle", e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Mission Text</Label>
                <Textarea
                  value={data.aboutMission}
                  onChange={(e) => update("aboutMission", e.target.value)}
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Floating Chat */}
        <TabsContent value="chat" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-base font-semibold">Floating Chat Widget</CardTitle>
              <CardDescription>
                A floating chat icon appears on every storefront page. When clicked, it expands to show
                social chat options. Leave a field blank to hide that icon from the widget.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Messenger Link</Label>
                <Input
                  value={data.chatLinks.messenger}
                  onChange={(e) => updateChatLink("messenger", e.target.value)}
                  placeholder="https://m.me/yourpage"
                />
                <p className="mt-1 text-xs text-muted-foreground">Your Facebook Messenger URL (m.me/username).</p>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">WhatsApp Link</Label>
                <Input
                  value={data.chatLinks.whatsapp}
                  onChange={(e) => updateChatLink("whatsapp", e.target.value)}
                  placeholder="https://wa.me/8801700000000"
                />
                <p className="mt-1 text-xs text-muted-foreground">Use https://wa.me/&lt;number&gt; format (country code, no +).</p>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">Instagram Link</Label>
                <Input
                  value={data.chatLinks.instagram}
                  onChange={(e) => updateChatLink("instagram", e.target.value)}
                  placeholder="https://instagram.com/yourhandle"
                />
                <p className="mt-1 text-xs text-muted-foreground">Your Instagram profile URL.</p>
              </div>
              <div className="rounded-lg border border-dashed border-border p-4 text-center">
                <p className="text-xs text-muted-foreground">
                  The floating chat icon only appears if at least one link is set above.
                  Currently active: <span className="font-medium text-foreground">
                    {["messenger", "whatsapp", "instagram"].filter((k) => (data.chatLinks as any)[k]?.trim()).length} of 3
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
