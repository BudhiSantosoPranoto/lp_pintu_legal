import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageCircle, HelpCircle } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { Reveal } from "@/components/site/section-primitives";
import { BreadcrumbNav } from "@/components/site/breadcrumb-nav";
import { ServiceCard } from "@/components/site/service-card";
import { ServiceComparison } from "@/components/layanan/service-comparison";
import { Button } from "@/components/ui/button";
import { getServices, getServicesForComparison } from "@/data/queries";
import { db } from "@/lib/db";
import { waLink } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Layanan Legalitas Bisnis — Pintu Legal",
  description:
    "Jelajahi layanan legalitas bisnis Pintu Legal: pendirian badan usaha (PT, CV, Yayasan), perubahan & perizinan, HKI, dan layanan pendukung untuk membantu bisnis Anda.",
  alternates: { canonical: "/layanan" },
};

// Known visual category chips (kept short for the chip row). Each maps to
// a category slug so the URL search param `?cat=slug` actually filters.
const CHIP_LABELS: { slug: string; label: string }[] = [
  { slug: "pendirian-badan-usaha", label: "Badan Usaha" },
  { slug: "perubahan-perizinan", label: "Perizinan" },
  { slug: "hki-kekayaan-intelektual", label: "HKI" },
  { slug: "layanan-pendukung", label: "Pendukung" },
  { slug: "semua", label: "Semua Layanan" },
];

export default async function LayananPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const sp = await searchParams;
  const activeCat = sp.cat && sp.cat !== "semua" ? sp.cat : null;

  const [allServices, categories, comparableServices] = await Promise.all([
    getServices(),
    db.serviceCategory.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    getServicesForComparison(),
  ]);

  // Map categoryId→slug via DB to filter the ServiceCard list by category.
  const catIdBySlug = new Map(categories.map((c) => [c.slug, c.id]));
  const catNameBySlug = new Map(categories.map((c) => [c.slug, c.name]));

  // ServiceCard doesn't carry categoryId, so re-query just slugs→categoryId
  // for filtering. Keep it lightweight.
  const servicesWithCat = await db.service.findMany({
    where: { isActive: true },
    select: { slug: true, categoryId: true },
  });
  const catIdByServiceSlug = new Map(
    servicesWithCat.map((s) => [s.slug, s.categoryId])
  );

  const services = activeCat
    ? allServices.filter(
        (s) => catIdByServiceSlug.get(s.slug) === catIdBySlug.get(activeCat)
      )
    : allServices;

  return (
    <SiteShell>
      {/* ─── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-surface-alt">
        <div className="absolute inset-0 bg-grid opacity-50" aria-hidden />
        <div
          className="absolute inset-x-0 -top-24 h-72 bg-gradient-to-b from-white to-transparent"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <Reveal>
            <BreadcrumbNav
              items={[
                { label: "Home", href: "/" },
                { label: "Layanan" },
              ]}
            />
          </Reveal>

          <div className="mt-6 max-w-3xl">
            <Reveal delay={0.05}>
              <span className="eyebrow">
                <span className="h-1 w-1 rounded-full bg-gold" />
                Layanan Kami
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight text-navy sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
                Temukan Pintu yang Tepat untuk Bisnis Anda.
              </h1>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
                Berbagai layanan legalitas bisnis untuk membantu Anda memulai,
                mengembangkan, dan menjaga bisnis tetap sesuai ketentuan.
                Pilih kategori di bawah untuk mempersempit pencarian.
              </p>
            </Reveal>
          </div>

          {/* Category filter chips + comparison trigger */}
          <Reveal delay={0.2}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div
                className="flex flex-wrap gap-2"
                role="navigation"
                aria-label="Filter layanan berdasarkan kategori"
              >
                {CHIP_LABELS.map((chip) => {
                  const isActive =
                    (chip.slug === "semua" && !activeCat) ||
                    activeCat === chip.slug;
                  const href =
                    chip.slug === "semua"
                      ? "/layanan"
                      : `/layanan?cat=${chip.slug}`;
                  return (
                    <Link
                      key={chip.slug}
                      href={href}
                      scroll={false}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                        isActive
                          ? "border-navy bg-navy text-white shadow-soft"
                          : "border-border bg-white text-ink-soft hover:border-gold-300 hover:text-navy"
                      )}
                    >
                      {isActive && (
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-gold"
                          aria-hidden
                        />
                      )}
                      {chip.label}
                    </Link>
                  );
                })}
              </div>

              {/* Comparison tool — hidden if there are fewer than 2 services */}
              {comparableServices.length >= 2 && (
                <ServiceComparison services={comparableServices} />
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Grid ──────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          {services.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface-alt p-10 text-center">
              <HelpCircle className="mx-auto h-8 w-8 text-ink-soft/60" />
              <p className="mt-3 text-sm text-ink-soft">
                Belum ada layanan dalam kategori ini. Silakan pilih kategori
                lain atau hubungi kami.
              </p>
            </div>
          ) : (
            <>
              {activeCat && (
                <div className="mb-8 flex items-center gap-2 text-sm text-ink-soft">
                  <span>Menampilkan</span>
                  <span className="font-semibold text-navy">
                    {services.length} layanan
                  </span>
                  <span>dalam kategori</span>
                  <span className="font-semibold text-navy">
                    {catNameBySlug.get(activeCat) ?? "—"}
                  </span>
                </div>
              )}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((s, i) => (
                  <Reveal key={s.id} delay={(i % 3) * 0.08}>
                    <ServiceCard service={s} className="h-full" />
                  </Reveal>
                ))}
              </div>
            </>
          )}

          {/* Secondary category index (always visible, supports discovery) */}
          <div className="mt-14 border-t border-border pt-10">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">
              Kategori Layanan
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/layanan?cat=${c.slug}`}
                  className="group rounded-xl border border-border bg-white p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-gold-200 hover:shadow-soft-lg"
                >
                  <p className="text-sm font-semibold text-navy group-hover:text-gold-600">
                    {c.name}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-ink-soft">
                    Lihat layanan
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA band ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-navy-mesh">
        <div className="bg-grid-navy pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-6 px-5 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold ring-1 ring-white/10">
              <span className="h-1 w-1 rounded-full bg-gold" />
              Butuh Bantuan?
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="max-w-2xl text-balance text-3xl font-bold leading-tight text-white sm:text-4xl">
              Tidak menemukan layanan yang sesuai? Konsultasikan kebutuhan Anda.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-xl text-base leading-relaxed text-white/70">
              Setiap bisnis memiliki kebutuhan legalitas yang berbeda. Tim Pintu
              Legal siap membantu mengidentifikasi solusi yang tepat.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 bg-gold px-6 text-base text-navy shadow-gold hover:bg-gold-400 hover:text-navy"
              >
                <Link href="/kontak">
                  Konsultasi Gratis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 border-white/30 bg-transparent px-6 text-base text-white hover:bg-white/10 hover:text-white"
              >
                <a
                  href={waLink(
                    "Halo Pintu Legal, saya tidak menemukan layanan yang sesuai dan ingin konsultasi."
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp Kami
                </a>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
