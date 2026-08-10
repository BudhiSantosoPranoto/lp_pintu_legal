"use client";

import * as React from "react";
import { ChevronDown, List } from "lucide-react";
import type { TocItem } from "@/components/site/markdown";
import { cn } from "@/lib/utils";

/**
 * Sticky Table of Contents with scrollspy.
 *
 * - Highlights the heading currently in view using IntersectionObserver.
 * - Smooth-scrolls to anchors via native `scroll-behavior: smooth`
 *   (set on <html>) + `scroll-mt-28` on rendered headings.
 * - `collapsible` variant: used on mobile — togglable list, default closed.
 *   Non-collapsible variant: used in desktop sticky sidebar — always open.
 *
 * The TOC item ids are produced by `getTableOfContents` from
 * `src/components/site/markdown.tsx` and match the `id` attributes
 * assigned to the rendered <h2>/<h3> elements.
 */
export function TableOfContents({
  items,
  collapsible = false,
}: {
  items: TocItem[];
  collapsible?: boolean;
}) {
  const [activeId, setActiveId] = React.useState<string>("");
  const [open, setOpen] = React.useState(false);

  // Scrollspy via IntersectionObserver. The rootMargin shrinks the active
  // band to roughly the navbar-offset top of the viewport so the active
  // heading updates just as it passes under the sticky navbar.
  React.useEffect(() => {
    if (items.length === 0) return;
    setActiveId(items[0].id);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top
          );
        if (visible.length > 0) {
          setActiveId((visible[0].target as HTMLElement).id);
        }
      },
      { rootMargin: "-96px 0px -65% 0px", threshold: 0 }
    );

    const els: HTMLElement[] = [];
    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) {
        observer.observe(el);
        els.push(el);
      }
    }

    return () => {
      els.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [items]);

  if (items.length === 0) return null;

  const handleItemClick = (id: string) => {
    setActiveId(id);
    if (collapsible) setOpen(false);
  };

  return (
    <nav
      aria-label="Daftar isi"
      className="rounded-2xl border border-border bg-white p-5 shadow-soft"
    >
      <button
        type="button"
        onClick={collapsible ? () => setOpen((o) => !o) : undefined}
        aria-expanded={collapsible ? open : undefined}
        aria-controls="toc-list"
        className={cn(
          "flex w-full items-center justify-between gap-2 text-left",
          !collapsible && "cursor-default"
        )}
      >
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">
          <List className="h-3.5 w-3.5" aria-hidden />
          Daftar Isi
        </span>
        {collapsible && (
          <ChevronDown
            aria-hidden
            className={cn(
              "h-4 w-4 text-ink-soft transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        )}
      </button>

      <ul
        id="toc-list"
        className={cn(
          "mt-4 space-y-0.5 text-sm",
          collapsible ? (open ? "block" : "hidden") : "block"
        )}
      >
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={() => handleItemClick(item.id)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "block rounded-md border-l-2 px-3 py-1.5 transition-colors",
                  item.level === 3
                    ? "ml-3 border-transparent pl-4 text-[0.85em]"
                    : "border-transparent",
                  isActive
                    ? "border-gold-400 bg-gold-50 font-medium text-gold-700"
                    : "text-ink-soft hover:border-border hover:bg-surface-alt hover:text-navy"
                )}
              >
                {item.text.replace(/\*\*/g, "")}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
