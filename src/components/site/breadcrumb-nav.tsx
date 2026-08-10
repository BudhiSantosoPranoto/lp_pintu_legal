import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

export type Crumb = {
  label: string;
  href?: string;
};

/**
 * Compact, accessible breadcrumb used on inner pages.
 * Renders "Home > … > Current" with nav semantics.
 */
export function BreadcrumbNav({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  return (
    <Breadcrumb className={cn("text-sm", className)}>
      <BreadcrumbList className="flex-wrap">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <span key={i} className="inline-flex items-center gap-1.5">
              <BreadcrumbItem>
                {item.href && !isLast ? (
                  <BreadcrumbLink asChild className="text-ink-soft hover:text-navy">
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="font-medium text-navy">
                    {item.label}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator className="text-ink-soft/50" />}
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
