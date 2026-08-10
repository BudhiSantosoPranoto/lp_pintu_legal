import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ServiceIcon } from "@/components/site/service-icon";
import { cn } from "@/lib/utils";
import type { ServiceCard } from "@/data/queries";

/**
 * Flat service card used on /layanan grid. Mirrors homepage card styling
 * but without the featured hero treatment — every card has equal weight.
 */
export function ServiceCard({
  service,
  className,
}: {
  service: ServiceCard;
  className?: string;
}) {
  return (
    <Link
      href={`/layanan/${service.slug}`}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg hover:border-gold-200",
        className
      )}
    >
      <div className="flex h-full flex-col">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-50 text-navy ring-1 ring-navy-100 transition-transform duration-300 group-hover:scale-110">
          <ServiceIcon name={service.icon} className="h-6 w-6" />
        </span>

        <h3 className="mt-4 text-lg font-bold text-navy">{service.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
          {service.shortDescription}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          {service.durationLabel ? (
            <span className="inline-flex items-center rounded-full bg-navy-50 px-2.5 py-1 text-[11px] font-medium text-navy">
              {service.durationLabel}
            </span>
          ) : (
            <span />
          )}
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-gold-600 transition-colors group-hover:text-gold">
            Pelajari
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
