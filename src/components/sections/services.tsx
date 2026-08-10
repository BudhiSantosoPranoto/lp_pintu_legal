import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  SectionHeading,
  Reveal,
} from "@/components/site/section-primitives";
import { ServiceIcon } from "@/components/site/service-icon";
import { getServices } from "@/data/queries";
import { cn } from "@/lib/utils";

export async function Services() {
  const services = await getServices();
  // Featured = first service (Pendirian PT). Falls back to first in list.
  const featured = services.find((s) => s.isFeatured) ?? services[0];

  return (
    <section
      aria-labelledby="services-heading"
      className="relative scroll-mt-24 py-20 sm:py-24"
    >
      <div className="container-px mx-auto max-w-7xl">
        <SectionHeading
          id="services-heading"
          eyebrow="Layanan Kami"
          title="Temukan Pintu yang Tepat untuk Bisnis Anda."
          description="Berbagai layanan legalitas bisnis untuk membantu Anda memulai, mengembangkan, dan menjaga bisnis tetap sesuai ketentuan."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => {
            const isFeatured = s.slug === featured?.slug;
            return (
              <Reveal
                key={s.id}
                delay={(i % 3) * 0.08}
                className={cn(
                  isFeatured && "lg:col-span-2"
                )}
              >
                <Link
                  href={`/layanan/${s.slug}`}
                  className={cn(
                    "group relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft-lg",
                    isFeatured
                      ? "border-navy-700 bg-gradient-to-br from-navy to-navy-600 text-white shadow-soft"
                      : "border-border bg-white shadow-soft hover:border-gold-200"
                  )}
                >
                  {isFeatured && (
                    <>
                      <div className="bg-grid-navy pointer-events-none absolute inset-0 opacity-40" />
                      <span className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full bg-gold/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold-200 ring-1 ring-gold/30">
                        Unggulan
                      </span>
                    </>
                  )}

                  <div className="relative z-10 flex h-full flex-col">
                    <span
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
                        isFeatured
                          ? "bg-white/10 text-gold ring-1 ring-white/15"
                          : "bg-navy-50 text-navy ring-1 ring-navy-100"
                      )}
                    >
                      <ServiceIcon name={s.icon} className="h-6 w-6" />
                    </span>

                    <h3
                      className={cn(
                        "mt-4 text-lg font-bold tracking-tight",
                        isFeatured ? "text-white" : "text-navy"
                      )}
                    >
                      {s.name}
                    </h3>
                    <p
                      className={cn(
                        "mt-2 flex-1 text-sm leading-relaxed",
                        isFeatured ? "text-white/75" : "text-ink-soft"
                      )}
                    >
                      {s.shortDescription}
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-3">
                      {s.durationLabel ? (
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium",
                            isFeatured
                              ? "bg-white/10 text-gold-200"
                              : "bg-navy-50 text-navy"
                          )}
                        >
                          {s.durationLabel}
                        </span>
                      ) : (
                        <span />
                      )}
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-sm font-semibold transition-colors",
                          isFeatured
                            ? "text-gold-200 group-hover:text-gold"
                            : "text-gold-600 group-hover:text-gold"
                        )}
                      >
                        Pelajari
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
