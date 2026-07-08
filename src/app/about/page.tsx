import type { Metadata } from "next";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { AboutContent } from "@/components/storefront/about-content";

export const metadata: Metadata = {
  title: "About",
  description: "The CLOTHING X story — premium quality, delivered with trust.",
};

export default function AboutPage() {
  return (
    <StorefrontShell>
      <AboutContent />
    </StorefrontShell>
  );
}
