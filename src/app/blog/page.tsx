import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText, Folder, ArrowUpRight } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import {
  Reveal,
  SectionHeading,
} from "@/components/site/section-primitives";
import { BreadcrumbNav } from "@/components/site/breadcrumb-nav";
import { NewsletterSignup } from "@/components/site/newsletter-signup";
import { Button } from "@/components/ui/button";
import {
  getPublishedPosts,
  getBlogCategories,
  getAllBlogTags,
  parseTags,
} from "@/data/queries";
import {
  BlogListClient,
  type BlogListPost,
  type BlogListTag,
} from "@/components/blog/blog-list-client";
import type { BlogSearchCategory } from "@/components/blog/blog-search";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Blog Legalitas Bisnis — Pintu Legal",
  description:
    "Insight dan panduan seputar legalitas bisnis di Indonesia: pendirian badan usaha, NIB & OSS, HKI, dan praktik administrasi perusahaan.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const [posts, categories, tagList] = await Promise.all([
    getPublishedPosts(),
    getBlogCategories(),
    getAllBlogTags(),
  ]);

  // Serialize posts into plain objects (Date → ISO string) so they can
  // cross the server/client boundary safely.
  const serializedPosts: BlogListPost[] = posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    authorName: p.authorName,
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    category: p.category ? { name: p.category.name, slug: p.category.slug } : null,
    tags: parseTags(p.tags),
  }));

  const serializedTags: BlogListTag[] = tagList;

  // Collect unique categories (preserving first-seen order) for the filter.
  const seenCat = new Set<string>();
  const filterCategories: BlogSearchCategory[] = [];
  for (const p of serializedPosts) {
    if (!p.category) continue;
    if (seenCat.has(p.category.slug)) continue;
    seenCat.add(p.category.slug);
    filterCategories.push({ slug: p.category.slug, name: p.category.name });
  }

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
                { label: "Blog" },
              ]}
            />
          </Reveal>

          <div className="mt-6 max-w-3xl">
            <Reveal delay={0.05}>
              <span className="eyebrow">
                <span className="h-1 w-1 rounded-full bg-gold" />
                Blog
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight text-navy sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
                Insight &amp; Panduan Legalitas Bisnis
              </h1>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
                Pelajari dasar-dasar legalitas bisnis dan temukan panduan
                praktis untuk membantu bisnis Anda tumbuh.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── Posts (interactive client island) ─────────────────────── */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface-alt p-10 text-center">
              <FileText className="mx-auto h-8 w-8 text-ink-soft/60" />
              <p className="mt-3 text-sm text-ink-soft">
                Belum ada artikel. Silakan kembali lagi nanti.
              </p>
            </div>
          ) : (
            <Suspense
              fallback={
                <div className="rounded-2xl border border-dashed border-border bg-surface-alt p-10 text-center">
                  <FileText className="mx-auto h-8 w-8 animate-pulse text-ink-soft/60" />
                  <p className="mt-3 text-sm text-ink-soft">Memuat artikel…</p>
                </div>
              }
            >
              <BlogListClient
                posts={serializedPosts}
                categories={filterCategories}
                tags={serializedTags}
              />
            </Suspense>
          )}

          {/* ─── Category section ──────────────────────────────────────── */}
          {categories.length > 0 && (
            <div className="mt-20">
              <SectionHeading
                align="left"
                eyebrow="JELAJAHI KATEGORI"
                title="Telusuri Artikel Berdasarkan Kategori"
                description="Temukan panduan dan insight sesuai topik yang Anda butuhkan."
              />
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((c, i) => (
                  <Reveal key={c.id} delay={Math.min(i * 0.05, 0.3)}>
                    <Link
                      href={`/blog/category/${c.slug}`}
                      className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg hover:border-gold-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-50 text-navy ring-1 ring-navy-100 transition-colors group-hover:bg-gold-50 group-hover:text-gold-600 group-hover:ring-gold-200">
                          <Folder className="h-5 w-5" />
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-surface-alt px-2.5 py-1 text-xs font-semibold text-ink-soft">
                          {c.postCount} Artikel
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-bold leading-snug text-navy transition-colors group-hover:text-gold-600">
                          {c.name}
                        </h3>
                        {c.description && (
                          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-soft">
                            {c.description}
                          </p>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gold-600 transition-colors group-hover:text-gold">
                        Lihat Artikel
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 overflow-hidden rounded-3xl border border-border bg-surface-alt p-8 sm:p-10">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <h2 className="text-balance text-2xl font-bold text-navy sm:text-3xl">
                  Butuh konsultasi untuk kebutuhan legalitas Anda?
                </h2>
                <p className="mt-3 text-base leading-relaxed text-ink-soft">
                  Tim Pintu Legal siap membantu menjelaskan pilihan layanan dan
                  tahapan yang dibutuhkan.
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
