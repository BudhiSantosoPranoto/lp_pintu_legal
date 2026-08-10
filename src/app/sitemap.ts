import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { siteConfig } from "@/lib/site";

export const revalidate = 3600; // 1 hour

// Freshness thresholds (ms). Used to dynamically score blog post priority
// based on how recently the post was published.
const DAY = 24 * 60 * 60 * 1000;
const FRESH_30 = 30 * DAY;
const FRESH_90 = 90 * DAY;
const FRESH_365 = 365 * DAY;

/**
 * Returns the dynamic priority for a blog post based on its freshness:
 *   - published within 30 days  → 0.8
 *   - published within 90 days  → 0.7
 *   - published within 365 days → 0.6
 *   - older than 365 days       → 0.5
 *
 * Falls back to 0.5 when the post has no publishedAt (shouldn't happen for
 * PUBLISHED posts, but defensive).
 */
function blogPostPriority(publishedAt: Date | null, now: Date): number {
  if (!publishedAt) return 0.5;
  const age = now.getTime() - publishedAt.getTime();
  if (age <= FRESH_30) return 0.8;
  if (age <= FRESH_90) return 0.7;
  if (age <= FRESH_365) return 0.6;
  return 0.5;
}

/** Fresh content = "weekly", older content = "monthly". */
function blogPostChangeFrequency(
  publishedAt: Date | null,
  now: Date
): MetadataRoute.Sitemap[number]["changeFrequency"] {
  if (!publishedAt) return "monthly";
  const age = now.getTime() - publishedAt.getTime();
  // Anything published within the last 90 days is considered "fresh" and
  // likely to be updated/iterated; older posts are typically stable.
  return age <= FRESH_90 ? "weekly" : "monthly";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const now = new Date();

  // OG image for the site
  const ogImage = `${base}/og-image.svg`;
  const logoImage = `${base}/images/pintu-legal-logo.png`;

  // Static routes — priorities tuned by importance:
  //   `/` is the most important entry point (1.0). Conversion-critical pages
  //   (`/kontak`, `/layanan`) get 0.9. Informational pages get 0.7–0.8.
  //   Low-value legal pages get 0.3.
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
      images: [ogImage, logoImage],
    },
    {
      url: `${base}/layanan`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
      images: [logoImage],
    },
    {
      url: `${base}/kontak`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${base}/harga`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
      images: [logoImage],
    },
    {
      url: `${base}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
      images: [ogImage],
    },
    {
      url: `${base}/tentang`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
      images: [logoImage],
    },
    {
      url: `${base}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/privacy-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Service routes — featured services get a higher priority than regular
  // ones so search engines know to surface them more aggressively.
  const services = await db.service.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true, isFeatured: true },
  });
  const serviceRoutes: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${base}/layanan/${s.slug}`,
    lastModified: s.updatedAt,
    changeFrequency: "monthly",
    priority: s.isFeatured ? 0.9 : 0.8,
    images: [logoImage],
  }));

  // Blog post routes — dynamic priority based on freshness, changeFrequency
  // flips from "weekly" (fresh) to "monthly" (older). lastModified uses
  // `updatedAt` (most recent edit) instead of `publishedAt` so that
  // editors republishing/refreshing old content gets crawled sooner.
  const posts = await db.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: {
      slug: true,
      publishedAt: true,
      updatedAt: true,
      featuredImage: true,
    },
  });
  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => {
    const imageUrl = p.featuredImage
      ? p.featuredImage.startsWith("http")
        ? p.featuredImage
        : `${base}${p.featuredImage}`
      : ogImage;
    return {
      url: `${base}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: blogPostChangeFrequency(p.publishedAt, now),
      priority: blogPostPriority(p.publishedAt, now),
      // `images` is typed as string[] (no per-image title/caption fields
      // in MetadataRoute.Sitemap), so we pass the resolved URL only.
      images: [imageUrl],
    };
  });

  // Blog category pages — slightly lower than the blog index since they're
  // aggregations of posts (less unique content than a single article).
  // BlogCategory has no updatedAt column, so we use `now` as the
  // lastModified (the post routes above carry the real freshness signal).
  const categories = await db.blogCategory.findMany({
    select: { slug: true },
  });
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${base}/blog/category/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...serviceRoutes, ...postRoutes, ...categoryRoutes];
}
