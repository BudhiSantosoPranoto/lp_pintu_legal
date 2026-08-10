import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { WebVitalsTracker } from "@/components/site/web-vitals-tracker";
import { siteConfig } from "@/lib/site";
import { db } from "@/lib/db";

/**
 * Font loading strategy (performance):
 *
 * Plus Jakarta Sans is split into two next/font instances so the
 * `<link rel="preload">` hints only cover the most common weights:
 *   - `jakartaPrimary` (400, 600, 700) — preloaded, covers ~95% of text
 *     on the page (body copy, headings, buttons).
 *   - `jakartaSecondary` (500, 800) — NOT preloaded; the browser fetches
 *     these woff2 files lazily the first time a 500/800 glyph is needed.
 *     Both still use `display: "swap"` so a fallback font paints
 *     immediately.
 *
 * JetBrains Mono is rarely used (only for code snippets / admin tables)
 * so it is also `preload: false` — no `<link rel="preload">` is emitted
 * until a page actually references `font-mono`.
 */
const jakartaPrimary = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700"],
  preload: true,
});

const jakartaSecondary = Plus_Jakarta_Sans({
  variable: "--font-jakarta-secondary",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "800"],
  preload: false,
});

const mono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0F2747" },
  ],
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  // Fetch Google Search Console verification token from site settings (if set).
  // This allows admin to add the verification meta tag without code changes.
  let googleVerification: string | undefined;
  try {
    const setting = await db.siteSetting.findUnique({
      where: { key: "google_site_verification" },
    });
    if (setting?.value) googleVerification = setting.value;
  } catch {
    // DB not available — skip verification
  }

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: "Pintu Legal — Legalitas Bisnis yang Lebih Mudah dan Terarah",
      template: "%s · Pintu Legal",
    },
    description: siteConfig.description,
    keywords: [
      "jasa pendirian PT",
      "pendirian PT",
      "pendirian CV",
      "jasa legalitas bisnis",
      "pendaftaran merek",
      "HKI",
      "NIB",
      "OSS",
      "virtual office",
    ],
    authors: [{ name: siteConfig.companyName }],
    creator: siteConfig.companyName,
    publisher: siteConfig.companyName,
    applicationName: siteConfig.brandName,
    alternates: { canonical: "/" },
    icons: {
      icon: [{ url: "/images/pintu-legal-icon.png", type: "image/png" }],
      apple: [{ url: "/images/pintu-legal-icon.png" }],
      shortcut: ["/images/pintu-legal-icon.png"],
    },
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: siteConfig.url,
      siteName: siteConfig.brandName,
      title: "Pintu Legal — Legalitas Bisnis yang Lebih Mudah dan Terarah",
      description: siteConfig.description,
      images: [
        {
          url: "/og-image.svg",
          width: 1200,
          height: 630,
          alt: siteConfig.brandName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Pintu Legal — Legalitas Bisnis yang Lebih Mudah dan Terarah",
      description: siteConfig.description,
      images: ["/og-image.svg"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    category: "business",
    verification: googleVerification
      ? { google: googleVerification }
      : undefined,
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${jakartaPrimary.variable} ${jakartaSecondary.variable} ${mono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          {children}
          <Toaster />
          <Sonner position="top-center" richColors closeButton />
          <WebVitalsTracker />
        </ThemeProvider>
      </body>
    </html>
  );
}
