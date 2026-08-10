import { siteConfig } from "@/lib/site";

/** Organization JSON-LD */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.brandName,
    legalName: siteConfig.companyName,
    url: siteConfig.url,
    description: siteConfig.description,
    email: siteConfig.email,
    ...(siteConfig.socials.instagram || siteConfig.socials.linkedin
      ? {
          sameAs: [
            siteConfig.socials.instagram,
            siteConfig.socials.linkedin,
            siteConfig.socials.facebook,
            siteConfig.socials.youtube,
          ].filter(Boolean),
        }
      : {}),
  };
}

/** Service JSON-LD for a service detail page */
export function serviceJsonLd(service: {
  name: string;
  description: string;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    provider: {
      "@type": "Organization",
      name: siteConfig.brandName,
      url: siteConfig.url,
    },
    url: `${siteConfig.url}/layanan/${service.slug}`,
    areaServed: "ID",
  };
}

/** FAQPage JSON-LD */
export function faqPageJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: i.answer,
      },
    })),
  };
}

/** Article JSON-LD for a blog post */
export function articleJsonLd(post: {
  title: string;
  excerpt: string;
  slug: string;
  authorName: string;
  publishedAt: Date | null | undefined;
  featuredImage?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    author: {
      "@type": "Organization",
      name: post.authorName || siteConfig.brandName,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.brandName,
      logo: { "@type": "ImageObject", url: `${siteConfig.url}/images/pintu-legal-icon.png` },
    },
    datePublished: post.publishedAt ?? undefined,
    dateModified: post.publishedAt ?? undefined,
    mainEntityOfPage: `${siteConfig.url}/blog/${post.slug}`,
    image: post.featuredImage
      ? post.featuredImage.startsWith("http")
        ? post.featuredImage
        : `${siteConfig.url}${post.featuredImage}`
      : `${siteConfig.url}/og-image.svg`,
  };
}

/** BreadcrumbList JSON-LD */
export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteConfig.url}${item.url}`,
    })),
  };
}
