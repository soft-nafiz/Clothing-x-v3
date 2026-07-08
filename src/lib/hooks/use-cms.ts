"use client";

import { useEffect, useState } from "react";

export interface ChatLinks {
  messenger: string;
  whatsapp: string;
  instagram: string;
}

export interface SocialLinks {
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  tiktok: string;
  linkedin: string;
  pinterest: string;
  whatsapp: string;
}

export interface CMSContent {
  announcement: string;
  announcementActive: boolean;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButtonText: string;
  ctaButtonLink: string;
  ctaImage: string;
  heroSlides: { title: string; subtitle: string; cta: string; image: string; href: string }[];
  homeFeaturedTitle: string;
  homeHotDealsTitle: string;
  homeNewArrivalsTitle: string;
  homeTrendingTitle: string;
  footerTagline: string;
  footerPhone: string;
  footerEmail: string;
  footerAddress: string;
  aboutTitle: string;
  aboutSubtitle: string;
  aboutMission: string;
  socialLinks: SocialLinks;
  chatLinks: ChatLinks;
}
export const DEFAULT_CHAT_LINKS: ChatLinks = {
  messenger: "",
  whatsapp: "",
  instagram: "",
};

export const DEFAULT_CMS: CMSContent = {
  announcement: "Free delivery inside Dhaka on orders over 5,000 taka — COD nationwide across 64 districts",
  announcementActive: true,
  ctaTitle: "Members get more.",
  ctaSubtitle: "Sign up for early access to drops, agent pricing and exclusive collections. Cash on delivery across all 64 districts.",
    ctaButtonText: "Create Account",
  ctaButtonLink: "/sign-up",
  ctaImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80",
  heroSlides: [
    { title: "WORLD CUP 2026", subtitle: "Official jerseys. Engineered for champions.", cta: "Shop the Drop", image: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1600&q=80", href: "/categories/fifa-2026-jersey" },
    { title: "PERFORMANCE UNLEASHED", subtitle: "Premium apparel built for the modern athlete.", cta: "Explore Sports", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1600&q=80", href: "/categories/sports" },
    { title: "THE GOLD STANDARD", subtitle: "Luxury essentials. Deliberately crafted.", cta: "Shop Men", image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1600&q=80", href: "/categories/men" },
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
  chatLinks: { ...DEFAULT_CHAT_LINKS },
    socialLinks: {
    facebook: "",
    instagram: "",
    twitter: "",
    youtube: "",
    tiktok: "",
    linkedin: "",
    pinterest: "",
    whatsapp: "",
  },
};

/** Hook to read CMS content from Supabase via API */
export function useCMS() {
  const [cms, setCms] = useState<CMSContent>(DEFAULT_CMS);

  useEffect(() => {
    fetch("/api/cms")
      .then((r) => r.json())
            .then((result) => {
        if (result.data) {
          setCms({
            ...DEFAULT_CMS,
            ...result.data,
            chatLinks: { ...DEFAULT_CHAT_LINKS, ...(result.data.chatLinks || {}) },
            socialLinks: { ...DEFAULT_CMS.socialLinks, ...(result.data.socialLinks || {}) },
            heroSlides: Array.isArray(result.data.heroSlides) && result.data.heroSlides.length > 0
              ? result.data.heroSlides
              : DEFAULT_CMS.heroSlides,
          });
        }
      })
      .catch(() => { /* use defaults */ });
  }, []);

  return cms;
}
