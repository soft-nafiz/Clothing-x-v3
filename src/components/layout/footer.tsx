"use client";

import Link from "next/link";
import { Mail, MapPin, Phone, Instagram, Facebook, Twitter, Youtube, Linkedin, MessageCircle, Download } from "lucide-react";
import { MaxWidthWrapper } from "@/components/shared/max-width-wrapper";
import { useCMS } from "@/lib/hooks/use-cms";
import type { Category, Brand, Collection } from "@/lib/data/types";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

interface Props {
  categories: Category[];
  brands: Brand[];
  collections: Collection[];
}

function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (installed) return null;

  return (
    <Button
      onClick={() => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
        } else {
          alert("To install this app:\n\n• Chrome/Edge: Click the install icon in the address bar\n• Safari (iOS): Tap Share → Add to Home Screen");
        }
      }}
      variant="outline"
      size="sm"
      className="mt-4 gap-2"
    >
      <Download className="h-4 w-4" />
      Install App
    </Button>
  );
}

export function Footer({ categories, brands, collections }: Props) {
  const cms = useCMS();

  const sl = cms.socialLinks || {};
  const socialIcons = [
    { key: "facebook", Icon: Facebook },
    { key: "instagram", Icon: Instagram },
    { key: "twitter", Icon: Twitter },
    { key: "youtube", Icon: Youtube },
    { key: "linkedin", Icon: Linkedin },
    { key: "whatsapp", Icon: MessageCircle },
  ].filter((s) => sl[s.key]?.trim());

  return (
    <footer className="mt-auto bg-background">
      <MaxWidthWrapper className="py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="inline-block">
              <img src="/logo-dark.png" alt="CLOTHING X" className="h-7 w-auto dark:block hidden" />
              <img src="/logo-light.png" alt="CLOTHING X" className="h-7 w-auto block dark:hidden" />
            </Link>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              {cms.footerTagline}
            </p>
            {/* Social links — only shows if configured in CMS */}
            {socialIcons.length > 0 && (
              <div className="mt-4 flex items-center gap-2">
                {socialIcons.map(({ key, Icon }) => (
                  <a key={key} href={sl[key]} target="_blank" rel="noopener noreferrer" className="rounded-full p-2 text-muted-foreground transition hover:bg-accent hover:text-primary" title={key}>
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
            {/* Install button — always shows */}
            <InstallButton />
          </div>

          {/* Categories */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Categories
            </p>
            <ul className="space-y-2.5 text-sm">
              {categories.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <Link href={`/categories/${c.slug}`} className="text-muted-foreground transition hover:text-foreground">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Brands */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Brands
            </p>
            <ul className="space-y-2.5 text-sm">
              {brands.map((b) => (
                <li key={b.id}>
                  <Link href={`/brands/${b.slug}`} className="text-muted-foreground transition hover:text-foreground">
                    {b.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Collections + contact */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Collections
            </p>
            <ul className="space-y-2.5 text-sm">
              {collections.map((c) => (
                <li key={c.id}>
                  <Link href={`/collections/${c.slug}`} className="text-muted-foreground transition hover:text-foreground">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
              <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {cms.footerPhone}</p>
              <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {cms.footerEmail}</p>
              <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {cms.footerAddress}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} CLOTHING X. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
            <Link href="/about" className="hover:text-foreground">About</Link>
            <Link href="/admin" className="hover:text-foreground">Admin</Link>
          </div>
        </div>
      </MaxWidthWrapper>
    </footer>
  );
}