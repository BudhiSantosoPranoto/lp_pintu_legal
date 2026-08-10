import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { NotFoundContent } from "@/components/site/not-found-content";

export const metadata: Metadata = {
  title: "Halaman Tidak Ditemukan",
  description:
    "Maaf, halaman yang Anda cari mungkin telah dipindahkan atau tidak tersedia.",
  robots: { index: false, follow: true },
};

/**
 * Root 404 page. Stays a server component per Next.js convention; the animated
 * UI lives in <NotFoundContent /> ("use client") so framer-motion is isolated.
 *
 * Wrapped in <SiteShell> so the navbar + footer appear, consistent with the
 * rest of the site.
 */
export default function NotFound() {
  return (
    <SiteShell>
      <NotFoundContent />
    </SiteShell>
  );
}
