import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowLeft, Folder, FileText } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import {
  Reveal,
  SectionHeading,
} from "@/components/site/section-primitives";
import { BreadcrumbNav } from "@/components/site/breadcrumb-nav";
import { BlogCard } from "@/components/site/blog-card";
import { NewsletterSignup } from "@/components/site/newsletter-signup";
import { Button } from "@/components/ui/button";
import {
  getBlogCategories,
  getCategoryBySlug,
  getPostsByCategory,
} from "@/data/queries";
import { siteConfig } from "@/lib/site";
import { breadcrumbJsonLd } from "@/lib/seo";

type Params = { slug: string };

/** Pre-render every category slug that has at least one published post. */
export async function generateStaticParams(): Promise<Params[]> {
  const cats = await getBlogCategories();
  return cats.map((c) => ({ slug: c.slug }));
}

/** Per-category SEO metadata. */
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Kategori tidak ditemukan" };

  const title = `Blog ${category.name} — Pintu Legal`;
  const description =
    category.description ??
    `Kumpulan artikel dalam kategori ${category.name} dari Pintu Legal.`;
  const canonical = `/blog/category/${category.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${siteConfig.url}/blog/category/${category.slug}`,
      siteName: siteConfig.brandName,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  const [posts, allCategories] = await Promise.all([
    getPostsByCategory(slug),
    getBlogCategories(),
  ]);

  // Other categories — exclude the current one. Used for the "Kategori lainnya" sidebar.
  const otherCategories = allCategories.filter((c) => c.slug !== slug);

  const description =
    category.description ??
    `Kumpulan artikel dalam kategori ${category.name} dari Pintu Legal.`;

  const crumbs = [
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: category.name, url: `/blog/category/${category.slug}` },
  ];

  const jsonLdScripts = [breadcrumbJsonLd(crumbs)];

  return (
    <SiteShell>
      {/* JSON-LD */}
      {jsonLdScripts.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* ─── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-surface-alt">
        <div className="absolute inset-0 bg-grid opacity-50" aria-hidden />
        <div
          className="absolute inset-x-0 -top-24 h-72 bg-gradient-to-b from-white to-transparent"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <Reveal>
            <BreadcrumbNav
              items={[
                { label: "Home", href: "/" },
                { label: "Blog", href: "/blog" },
                { label: category.name },
              ]}
            />
          </Reveal>

          <div className="mt-6 max-w-3xl">
            <Reveal delay={0.05}>
              <span className="eyebrow">
                <span className="h-1 w-1 rounded-full bg-gold" />
                Kategori Blog
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight text-navy sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
                {category.name}
              </h1>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
                {description}
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-navy px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white shadow-soft">
                <Folder className="h-3.5 w-3.5 text-gold" />
                {posts.length} Artikel
              </span>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── Posts grid ─────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface-alt p-10 text-center">
              <FileText className="mx-auto h-8 w-8 text-ink-soft/60" />
              <p className="mt-3 text-sm font-medium text-navy">
                Belum ada artikel dalam kategori ini.
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                Lihat artikel lain di blog Pintu Legal.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-5">
                <Link href="/blog">
                  <ArrowLeft className="h-4 w-4" />
                  Kembali ke Blog
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">
                Artikel dalam Kategori Ini
              </h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((p, i) => (
                  <Reveal key={p.id} delay={Math.min(i * 0.05, 0.3)}>
                    <BlogCard post={p} className="h-full" />
                  </Reveal>
                ))}
              </div>
            </>
          )}

          {/* ─── Other categories ──────────────────────────────────────── */}
          {otherCategories.length > 0 && (
            <div className="mt-16">
              <SectionHeading
                align="left"
                eyebrow="KATEGORI LAINNYA"
                title="Telusuri Kategori Lain"
                description="Temukan panduan dan insight sesuai topik yang Anda butuhkan."
              />
              <div className="mt-6 flex flex-wrap gap-3">
                {otherCategories.map((c) => (
                  <Reveal key={c.id}>
                    <Link
                      href={`/blog/category/${c.slug}`}
                      className="group inline-flex items-center gap-2.5 rounded-full border border-border bg-white px-4 py-2.5 text-sm font-medium text-navy shadow-soft transition-all hover:-translate-y-0.5 hover:border-gold-200 hover:shadow-soft-lg"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-50 text-navy ring-1 ring-navy-100 transition-colors group-hover:bg-gold-50 group-hover:text-gold-600 group-hover:ring-gold-200">
                        <Folder className="h-3.5 w-3.5" />
                      </span>
                      {c.name}
                      <span className="rounded-full bg-surface-alt px-2 py-0.5 text-[11px] font-semibold text-ink-soft">
                        {c.postCount}
                      </span>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          {/* ─── CTA ──────────────────────────────────────────────────── */}
          <div className="mt-16 overflow-hidden rounded-3xl border border-border bg-surface-alt p-8 sm:p-10">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <h2 className="text-balance text-2xl font-bold text-navy sm:text-3xl">
                  Butuh konsultasi?
                </h2>
                <p className="mt-3 text-base leading-relaxed text-ink-soft">
                  Tim Pintu Legal siap membantu menjelaskan pilihan layanan dan
                  tahapan yang dibutuhkan untuk bisnis Anda.
                </p>
              </div>
              <Button asChild size="lg" className="h-12 shrink-0 px-6 text-base">
                <Link href="/kontak">
                  Konsultasi Gratis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Newsletter signup */}
          <Reveal className="mt-10">
            <NewsletterSignup />
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
