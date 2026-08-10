import { db } from "@/lib/db";

export type ServiceCard = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  icon: string;
  durationLabel: string | null;
  priceLabel: string | null;
  isFeatured: boolean;
};

function parse<T = string[]>(raw: string | null | undefined): T[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T;
  } catch {
    return [];
  }
}

/**
 * Parse the comma-separated `tags` column on BlogPost into a clean string[]
 * of lowercase, trimmed tags. Each tag is capped at 30 chars (per spec) and
 * duplicates are removed while preserving first-seen order.
 *
 * Empty/whitespace-only input returns []. Tags are intentionally NOT
 * slugified — they're free-form lowercase labels (e.g. "pt", "nib", "panduan").
 */
export function parseTags(raw: string | null | undefined): string[] {
  if (!raw) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const piece of raw.split(",")) {
    const tag = piece.trim().toLowerCase().slice(0, 30);
    if (!tag) continue;
    if (seen.has(tag)) continue;
    seen.add(tag);
    out.push(tag);
  }
  return out;
}

/**
 * Normalize a free-form comma-separated tag input string (e.g. from the
 * admin form) into the canonical storage format: lowercase, trimmed,
 * 30-char-capped, deduplicated, comma-joined. Empty input → "".
 */
export function normalizeTagsInput(input: string): string {
  return parseTags(input).join(",");
}

/** Get all active services ordered by sortOrder. */
export async function getServices(): Promise<ServiceCard[]> {
  const services = await db.service.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return services.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    shortDescription: s.shortDescription,
    description: s.description,
    icon: s.icon,
    durationLabel: s.durationLabel,
    priceLabel: s.priceLabel,
    isFeatured: s.isFeatured,
  }));
}

export type ServiceDetail = ServiceCard & {
  highlights: string[];
  processSteps: string[];
  requirements: string[];
  faqs: { q: string; a: string }[];
  metaTitle: string | null;
  metaDescription: string | null;
  category: { name: string; slug: string } | null;
};

export async function getServiceBySlug(slug: string): Promise<ServiceDetail | null> {
  const s = await db.service.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!s || !s.isActive) return null;
  return {
    id: s.id,
    slug: s.slug,
    name: s.name,
    shortDescription: s.shortDescription,
    description: s.description,
    icon: s.icon,
    durationLabel: s.durationLabel,
    priceLabel: s.priceLabel,
    isFeatured: s.isFeatured,
    highlights: parse(s.highlights),
    processSteps: parse(s.processSteps),
    requirements: parse(s.requirements),
    faqs: parse<{ q: string; a: string }>(s.faqsJson),
    metaTitle: s.metaTitle,
    metaDescription: s.metaDescription,
    category: s.category ? { name: s.category.name, slug: s.category.slug } : null,
  };
}

export async function getFaqs(category?: string) {
  return db.faq.findMany({
    where: { isActive: true, ...(category ? { category } : {}) },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

/**
 * Returns global FAQs relevant to a specific service.
 * Strategy: match FAQ question/answer against service name + category name keywords.
 * Falls back to general "Umum" category FAQs if no keyword matches.
 * Returns up to `limit` FAQs (default 4).
 */
export async function getRelevantFaqsForService(
  serviceName: string,
  categoryName: string | null,
  limit = 4
) {
  const allFaqs = await db.faq.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  // Build keywords from service name + category
  const keywords = [
    ...serviceName.toLowerCase().split(/\s+/),
    ...(categoryName ? categoryName.toLowerCase().split(/\s+/) : []),
  ].filter((k) => k.length > 3); // only meaningful keywords

  // Score each FAQ by keyword matches
  const scored = allFaqs.map((faq) => {
    const text = (faq.question + " " + faq.answer).toLowerCase();
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) score += 1;
    }
    return { faq, score };
  });

  // Prefer keyword-matched FAQs, then fall back to "Umum" category
  const matched = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.faq);

  if (matched.length >= limit) {
    return matched.slice(0, limit);
  }

  // Fill with "Umum" category FAQs not already included
  const matchedIds = new Set(matched.map((f) => f.id));
  const fillers = allFaqs.filter(
    (f) => !matchedIds.has(f.id) && f.category === "Umum"
  );

  return [...matched, ...fillers].slice(0, limit);
}

export async function getTestimonials(limit?: number) {
  return db.testimonial.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    ...(limit ? { take: limit } : {}),
  });
}

export async function getPublishedPosts(limit?: number) {
  return db.blogPost.findMany({
    where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    include: { category: true },
    ...(limit ? { take: limit } : {}),
  });
}

export async function getPostBySlug(slug: string) {
  return db.blogPost.findUnique({
    where: { slug },
    include: { category: true },
  });
}

// ─── Blog categories ────────────────────────────────────────────────────────

export type BlogCategoryWithCount = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  postCount: number;
};

/**
 * Returns every blog category that has at least one PUBLISHED post, with the
 * count of published posts in each. Ordered by `sortOrder` asc then name asc.
 *
 * Categories with zero published posts are excluded so the public blog
 * listing/sidebar never shows empty links.
 */
export async function getBlogCategories(): Promise<BlogCategoryWithCount[]> {
  const cats = await db.blogCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          posts: {
            where: {
              status: "PUBLISHED",
              publishedAt: { lte: new Date() },
            },
          },
        },
      },
    },
  });

  return cats
    .filter((c) => c._count.posts > 0)
    .map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      sortOrder: c.sortOrder,
      postCount: c._count.posts,
    }));
}

export type BlogCategoryDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
};

/** Returns a single category by slug, or null when not found. */
export async function getCategoryBySlug(
  slug: string
): Promise<BlogCategoryDetail | null> {
  const c = await db.blogCategory.findUnique({ where: { slug } });
  if (!c) return null;
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    sortOrder: c.sortOrder,
  };
}

/**
 * Returns published posts in a specific category (matched by slug), ordered
 * by publishedAt desc. Includes the category relation.
 */
export async function getPostsByCategory(slug: string, limit?: number) {
  return db.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
      category: { slug },
    },
    orderBy: { publishedAt: "desc" },
    include: { category: true },
    ...(limit ? { take: limit } : {}),
  });
}

// ─── Related content helpers ─────────────────────────────────────────────────

/**
 * Returns up to `limit` services related to the service identified by `slug`.
 *
 * Strategy:
 *   1. Look up the source service's categoryId.
 *   2. Take up to `limit` OTHER active services in the same category.
 *   3. If still short, fill with other active services from any category
 *      (excluding the source + already-selected ones) up to `limit`.
 *
 * Returns the same shape as `getServices()` so the existing ServiceCard
 * component can render the results without changes.
 */
export async function getRelatedServices(
  slug: string,
  limit = 3
): Promise<ServiceCard[]> {
  const source = await db.service.findUnique({
    where: { slug },
    select: { id: true, categoryId: true },
  });
  if (!source) return [];

  const take = Math.max(1, limit);
  const excludeIds = new Set<string>([source.id]);

  // 1) Same category (excluding current).
  const sameCategory = source.categoryId
    ? await db.service.findMany({
        where: {
          isActive: true,
          id: { not: source.id },
          categoryId: source.categoryId,
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        take,
      })
    : [];
  sameCategory.forEach((s) => excludeIds.add(s.id));

  const results = [...sameCategory];

  // 2) Fill with other active services if needed.
  if (results.length < take) {
    const fillers = await db.service.findMany({
      where: {
        isActive: true,
        id: { notIn: Array.from(excludeIds) },
      },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
      take: take - results.length,
    });
    results.push(...fillers);
  }

  return results.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    shortDescription: s.shortDescription,
    description: s.description,
    icon: s.icon,
    durationLabel: s.durationLabel,
    priceLabel: s.priceLabel,
    isFeatured: s.isFeatured,
  }));
}

/**
 * Returns up to `limit` published posts related to the post identified by
 * `slug`. Same strategy as `getRelatedServices`: same category first, then
 * fill with other published posts. Includes the category relation.
 *
 * Scoring:
 *   - same category: +3
 *   - each shared tag: +2
 *   - each keyword match (title+excerpt): +1
 *
 * Ties are broken by publishedAt desc.
 */
export async function getRelatedPosts(slug: string, limit = 3) {
  const source = await db.blogPost.findUnique({
    where: { slug },
    select: { id: true, title: true, excerpt: true, categoryId: true, tags: true },
  });
  if (!source) return [];

  const take = Math.max(1, limit);

  // Extract keywords from source post title + excerpt
  const sourceText = `${source.title} ${source.excerpt}`.toLowerCase();
  const stopwords = new Set([
    "yang", "dan", "di", "ke", "dari", "untuk", "dengan", "atau", "ini",
    "itu", "juga", "akan", "pada", "dalam", "agar", "bisa", "tidak", "lebih",
    "saya", "kami", "anda", "mereka", "sebuah", "setiap", "oleh", "saat",
    "telah", "namun", "karena", "seperti", "yaitu", "yaitu", "the", "a", "an",
    "is", "are", "to", "in", "on", "for", "of", "with", "and", "or",
  ]);
  const sourceKeywords = sourceText
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ""))
    .filter((w) => w.length > 3 && !stopwords.has(w));
  const sourceKeywordSet = new Set(sourceKeywords);

  // Parse source tags once.
  const sourceTags = new Set(parseTags(source.tags));

  // Fetch all published posts (excluding current) for scoring
  const candidates = await db.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
      id: { not: source.id },
    },
    orderBy: { publishedAt: "desc" },
    include: { category: true },
  });

  // Score each candidate:
  //   - same category: +3
  //   - shared tags: +2 per shared tag
  //   - keyword matches: +1 per match
  const scored = candidates.map((post) => {
    let score = 0;
    // Same category bonus
    if (source.categoryId && post.categoryId === source.categoryId) {
      score += 3;
    }
    // Shared tags bonus (+2 per shared tag)
    if (sourceTags.size > 0) {
      const postTags = parseTags(post.tags);
      for (const t of postTags) {
        if (sourceTags.has(t)) score += 2;
      }
    }
    // Keyword matching
    const postText = `${post.title} ${post.excerpt}`.toLowerCase();
    const postWords = postText
      .split(/\s+/)
      .map((w) => w.replace(/[^a-z0-9]/g, ""))
      .filter((w) => w.length > 3);
    const postWordSet = new Set(postWords);
    for (const kw of sourceKeywordSet) {
      if (postWordSet.has(kw)) score += 1;
    }
    return { post, score };
  });

  // Sort by score (desc), then by publishedAt (desc) for ties
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const at = a.post.publishedAt?.getTime() ?? 0;
    const bt = b.post.publishedAt?.getTime() ?? 0;
    return bt - at;
  });

  return scored.slice(0, take).map((s) => s.post);
}

/**
 * Returns the union of all tags used across PUBLISHED posts, paired with the
 * count of posts that use each tag. Sorted by count desc then alpha asc.
 *
 * Used by the blog listing "tag cloud" / chip row.
 */
export async function getAllBlogTags(): Promise<{ tag: string; count: number }[]> {
  const posts = await db.blogPost.findMany({
    where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
    select: { tags: true },
  });
  const counts = new Map<string, number>();
  for (const p of posts) {
    for (const t of parseTags(p.tags)) {
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.tag.localeCompare(b.tag);
    });
}

// ─── Service comparison data ─────────────────────────────────────────────────

/**
 * Lightweight shape used by the service-comparison client component.
 * Carries the fields shown in the comparison table plus the highlights /
 * requirements lists (trimmed client-side to the first 3 entries).
 */
export type ComparableService = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  durationLabel: string | null;
  highlights: string[];
  requirements: string[];
  category: { name: string; slug: string } | null;
};

/**
 * Returns every active service with the data needed by the comparison tool.
 * Ordered by category then sortOrder for a sensible selection list.
 */
export async function getServicesForComparison(): Promise<ComparableService[]> {
  const services = await db.service.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return services.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    shortDescription: s.shortDescription,
    durationLabel: s.durationLabel,
    highlights: parse(s.highlights),
    requirements: parse(s.requirements),
    category: s.category
      ? { name: s.category.name, slug: s.category.slug }
      : null,
  }));
}
