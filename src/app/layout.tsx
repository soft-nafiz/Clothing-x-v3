import type { Metadata, Viewport } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/providers";
import { ServiceWorkerRegister } from "@/components/layout/sw-register";
import { cn } from "@/lib/utils";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://clothingx.com"),
  title: {
    default: "CLOTHING X — Premium Lifestyle Apparel | COD Across Bangladesh",
    template: "%s — CLOTHING X",
  },
  description:
    "Shop premium menswear, womenswear, jerseys, sports apparel & luxury essentials in Bangladesh. Cash on delivery (COD) across all 64 districts. Authenticity guaranteed. 7-day refund.",
  keywords: [
    "Clothing X", "Bangladesh fashion", "premium clothing Bangladesh", "luxury apparel Dhaka",
    "COD shopping Bangladesh", "menswear Bangladesh", "womenswear Bangladesh", "jerseys Bangladesh",
    "sports apparel Dhaka", "FIFA 2026 jersey", "world cup jersey Bangladesh",
    "online shopping Bangladesh", "clothing store Dhaka", "t-shirt Bangladesh",
    "trousers Bangladesh", "men collection", "women collection", "export collection",
  ],
  authors: [{ name: "CLOTHING X" }],
  creator: "CLOTHING X",
  publisher: "CLOTHING X",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CLOTHING X",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    title: "CLOTHING X — Premium Lifestyle Apparel | COD Across Bangladesh",
    description: "Shop premium menswear, womenswear, jerseys & luxury essentials. Cash on delivery across all 64 districts of Bangladesh.",
    url: "https://clothingx.com",
    siteName: "CLOTHING X",
    type: "website",
    locale: "en_US",
    images: [{ url: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80", width: 1200, height: 630, alt: "CLOTHING X — Premium Lifestyle Apparel" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CLOTHING X — Premium Lifestyle Apparel",
    description: "Premium essentials & luxury apparel. COD nationwide across Bangladesh.",
    images: ["https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#D48D4E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", outfit.variable, dmSans.variable)}
    >
      <head>
        {/* PWA manifest link */}
        <link rel="manifest" href="/manifest.json" />
        {/* Favicon — .ico for legacy browsers, PNG for modern */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#D48D4E" />
        {/* Mobile web app capable */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CLOTHING X" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>
          {children}
          <ServiceWorkerRegister />
        </Providers>
      </body>
    </html>
  );
}
