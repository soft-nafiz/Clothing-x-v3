"use client";

import { useState } from "react";
import { Facebook, Twitter, Instagram, Share2, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Props {
  product: {
    name: string;
    images?: string[];
    base_price?: number;
  };
  productId: string;
}

function FacebookIcon({ className }: { className?: string }) {
  return <Facebook className={className} />;
}

function TwitterIcon({ className }: { className?: string }) {
  // X (Twitter) logo
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

export function ProductShareButtons({ product, productId }: Props) {
  const [copied, setCopied] = useState(false);

  // Build the product URL (client-side)
  const productUrl = typeof window !== "undefined" ? `${window.location.origin}/products/${productId}` : "";
  const shareText = `Check out ${product.name} on CLOTHING X!`;
  const imageUrl = product.images?.[0] ?? "";

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}&quote=${encodeURIComponent(shareText)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productUrl)}`;
  // Instagram doesn't support direct web URL sharing — opens Instagram
  const instagramUrl = "https://www.instagram.com/";

  function openShare(url: string) {
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=600");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: shareText,
          url: productUrl,
        });
      } catch {
        // User cancelled — no action needed
      }
    } else {
      copyLink();
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Facebook */}
      <Button
        onClick={() => openShare(facebookUrl)}
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-full border-border text-muted-foreground hover:border-[#1877F2] hover:bg-[#1877F2] hover:text-white"
        title="Share on Facebook"
        aria-label="Share on Facebook"
      >
        <FacebookIcon className="h-4 w-4" />
      </Button>

      {/* X (Twitter) */}
      <Button
        onClick={() => openShare(twitterUrl)}
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-full border-border text-muted-foreground hover:border-foreground hover:bg-foreground hover:text-background"
        title="Share on X"
        aria-label="Share on X"
      >
        <TwitterIcon className="h-4 w-4" />
      </Button>

      {/* Instagram */}
      <Button
        onClick={() => openShare(instagramUrl)}
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-full border-border text-muted-foreground hover:border-[#E1306C] hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#E1306C] hover:to-[#FCAF45] hover:text-white"
        title="Share on Instagram"
        aria-label="Share on Instagram"
      >
        <InstagramIcon className="h-4 w-4" />
      </Button>

      {/* Copy link */}
      <Button
        onClick={copyLink}
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-full border-border text-muted-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground"
        title="Copy link"
        aria-label="Copy link"
      >
        {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
      </Button>

      {/* Native share (mobile) / More options */}
      <Button
        onClick={nativeShare}
        size="sm"
        className="gap-1.5 rounded-full"
        title="Share"
      >
        <Share2 className="h-4 w-4" />
        <span className="hidden sm:inline">Share</span>
      </Button>
    </div>
  );
}
