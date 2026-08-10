import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { SiteShell } from "@/components/layout/site-shell";
import {
  Reveal,
  SectionHeading,
} from "@/components/site/section-primitives";
import { BreadcrumbNav } from "@/components/site/breadcrumb-nav";
import { BlogCard } from "@/components/site/blog-card";
import { Markdown, getTableOfContents } from "@/components/site/markdown";
import { Button } from "@/components/ui/button";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { ShareButtons } from "@/components/blog/share-buttons";
import { AuthorBio } from "@/components/blog/author-bio";
import {
  getPublishedPosts,
  getPostBySlug,
  getRelatedPosts,
  parseTags,
} from "@/data/queries";
import { siteConfig } from "@/lib/site";
import { calculateReadingTime } from "@/lib/reading-time";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";

type Params = { slug: string };

/** Pre-render all published blog posts at build time. */
export async function generateStaticParams(): Promise<Params[]> {
  const posts = await getPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

/** Per-post SEO metadata. */
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Artikel tidak ditemukan" };

  const title = post.metaTitle ?? post.title;
  const description = post.metaDescription ?? post.excerpt;
  const canonical = post.canonicalUrl ?? `/blog/${post.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title,
      description,
      url: `${siteConfig.url}/blog/${post.slug}`,
      siteName: siteConfig.brandName,
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.authorName],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || post.status !== "PUBLISHED" || !post.publishedAt) {
    notFound();
  }

  // Fetch other latest posts for the "Artikel lainnya" sidebar.
  const allPosts = await getPublishedPosts(4);
  const others = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  // Related posts (same category first) for the bottom "Artikel Terkait" section.
  const relatedPosts = await getRelatedPosts(slug, 3);

  const publishedLabel = format(post.publishedAt, "d MMMM yyyy", {
    locale: idLocale,
  });
  const readingTime = calculateReadingTime(post.content);

  // Show "Diperbarui" only if the post was updated more than 1 day after
  // it was published (otherwise updatedAt === publishedAt on first publish).
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const updatedLabel =
    post.updatedAt.getTime() - post.publishedAt.getTime() > ONE_DAY_MS
      ? format(post.updatedAt, "d MMMM yyyy", { locale: idLocale })
      : null;

  // Build the TOC items (## and ### only) — ids match the rendered <h2>/<h3>.
  const tocItems = getTableOfContents(post.content);

  // Parse the comma-separated `tags` column into a clean lowercase list for
  // the gold-50 pill row below the title.
  const postTags = parseTags(post.tags);

  // Canonical share URL.
  const shareUrl = `${siteConfig.url}/blog/${post.slug}`;

  const crumbs = [
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.title, url: `/blog/${post.slug}` },
  ];

  const jsonLdScripts = [
    articleJsonLd({
      title: post.title,
      excerpt: post.excerpt,
      slug: post.slug,
      authorName: post.authorName,
      publishedAt: post.publishedAt,
      featuredImage: post.featuredImage,
    }),
    breadcrumbJsonLd(crumbs),
  ];

  return (
    <SiteShell>
      {/* Reading progress bar (fixed, top of viewport) */}
      <ReadingProgress />

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
        <div className="relative mx-auto max-w-3xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <Reveal>
            <BreadcrumbNav
              items={[
                { label: "Home", href: "/" },
                { label: "Blog", href: "/blog" },
                { label: post.title },
              ]}
            />
          </Reveal>

          {post.category && (
            <Reveal delay={0.05}>
              <Link
                href={`/blog/category/${post.category.slug}`}
                className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-navy-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-navy ring-1 ring-navy-100 transition-colors hover:bg-gold-50 hover:text-gold-600 hover:ring-gold-200"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                {post.category.name}
              </Link>
            </Reveal>
          )}

          <Reveal delay={0.1}>
            <h1 className="mt-5 text-balance text-3xl font-bold tracking-tight text-navy sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
              {post.title}
            </h1>
          </Reveal>

          {/* Tags — small gold-50 pills below the title. Each links to the
              blog listing filtered by that tag (deep-linkable URL). */}
          {postTags.length > 0 && (
            <Reveal delay={0.12}>
              <div className="mt-5 flex flex-wrap gap-2">
                {postTags.map((t) => (
                  <Link
                    key={t}
                    href={`/blog?tag=${encodeURIComponent(t)}`}
                    prefetch={false}
                    className="inline-flex items-center rounded-full bg-gold-50 px-3 py-1 text-xs font-medium text-gold-600 ring-1 ring-gold-100 transition-colors hover:bg-gold-100 hover:text-gold-600"
                    aria-label={`Lihat artikel lain dengan tag ${t}`}
                  >
                    #{t}
                  </Link>
                ))}
              </div>
            </Reveal>
          )}

          <Reveal delay={0.15}>
            <p className="mt-5 text-base leading-relaxed text-ink-soft sm:text-lg">
              {post.excerpt}
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-6 border-t border-border pt-5 text-sm text-ink-soft">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-4 w-4 text-gold-600" />
                  <span className="font-medium text-navy">{post.authorName}</span>
                </span>
                <span className="inline-flex items-start gap-1.5">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                  <span className="flex flex-col">
                    <time dateTime={post.publishedAt.toISOString()}>
                      {publishedLabel}
                    </time>
                    {updatedLabel && (
                      <span className="text-xs text-ink-soft/80">
                        Diperbarui {updatedLabel}
                      </span>
                    )}
                  </span>
                </span>
                {readingTime > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-gold-600" />
                    <span>{readingTime} min baca</span>
                  </span>
                )}
              </div>
            </div>
          </Reveal>

          {/* Share row — top of article */}
          <Reveal delay={0.25}>
            <ShareButtons
              url={shareUrl}
              title={post.title}
              className="mt-6"
            />
          </Reveal>
        </div>
      </section>

      {/* ─── Article body ──────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Main */}
            <article className="lg:col-span-8">
              {/* Mobile TOC — collapsible, shown above article body */}
              {tocItems.length > 0 && (
                <div className="mb-8 lg:hidden">
                  <TableOfContents items={tocItems} collapsible />
                </div>
              )}

              {/* Article content wrapper — tracked by ReadingProgress */}
              <div data-article-content>
                {/* Featured image — real image via next/image when
                    available, otherwise the navy gradient placeholder.
                    Uses `priority` because it sits at the top of the
                    article body and is likely visible on initial load. */}
                <Reveal>
                  <div
                    className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-navy to-navy-600 shadow-soft"
                  >
                    {post.featuredImage ? (
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 832px"
                        priority
                        placeholder="empty"
                        className="object-cover"
                      />
                    ) : (
                      <div aria-hidden>
                        <div className="bg-grid-navy absolute inset-0 opacity-40" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-end p-5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-navy shadow-soft backdrop-blur-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                        {post.category?.name ?? "Artikel"}
                      </span>
                    </div>
                  </div>
                </Reveal>

                <div className="mt-8">
                  <Markdown content={post.content} />
                </div>

                {/* End-of-article share row */}
                <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <ShareButtons
                    url={shareUrl}
                    title={post.title}
                  />
                </div>

                {/* Author bio — replaces the minimal author footer */}
                <div className="mt-10">
                  <AuthorBio authorName={post.authorName} />
                </div>

                {/* CTA */}
                <div className="relative mt-10 overflow-hidden rounded-2xl bg-navy-mesh p-7 sm:p-8">
                  <div className="bg-grid-navy pointer-events-none absolute inset-0 opacity-30" />
                  <div className="relative z-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white sm:text-2xl">
                        Butuh konsultasi?
                      </h2>
                      <p className="mt-2 text-sm leading-relaxed text-white/70">
                        Tim Pintu Legal siap membantu kebutuhan legalitas bisnis
                        Anda.
                      </p>
                    </div>
                    <Button
                      asChild
                      size="lg"
                      className="shrink-0 bg-gold text-navy hover:bg-gold-400 hover:text-navy"
                    >
                      <Link href="/kontak">
                        Konsultasi Gratis
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </article>

            {/* Sidebar — TOC (desktop) + other posts */}
            <aside className="lg:col-span-4">
              <div className="space-y-6 lg:sticky lg:top-24">
                {/* Desktop TOC */}
                {tocItems.length > 0 && (
                  <div className="hidden lg:block">
                    <TableOfContents items={tocItems} />
                  </div>
                )}

                {/* Other posts */}
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">
                    Artikel lainnya
                  </h2>
                  {others.length === 0 ? (
                    <p className="mt-4 text-sm text-ink-soft">
                      Belum ada artikel lain.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-4">
                      {others.map((p) => (
                        <BlogCard key={p.id} post={p} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ─── Related posts ─────────────────────────────────────────── */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-border bg-surface-alt py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="ARTIKEL TERKAIT"
              title="Baca Juga"
              description="Artikel lain dengan topik serupa yang mungkin relevan untuk Anda."
            />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.08}>
                  <BlogCard post={p} className="h-full" />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteShell>
  );
}
