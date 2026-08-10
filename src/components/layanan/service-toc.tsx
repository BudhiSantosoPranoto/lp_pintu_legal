"use client";

import * as React from "react";
import {
  HelpCircle,
  FileText,
  Info,
  ListChecks,
  ListChecks as ProcessIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TocItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const BASE_TOC_ITEMS: TocItem[] = [
  { id: "service-tabs", label: "Konten Layanan", icon: Info },
  { id: "service-sidebar", label: "Ringkasan & CTA", icon: ListChecks },
  { id: "related-services", label: "Layanan Terkait", icon: FileText },
  { id: "service-cta", label: "Konsultasi", icon: HelpCircle },
];

/** Sub-section anchors only present in scroll view. */
const SCROLL_SUB_ITEMS: TocItem[] = [
  { id: "service-tentang", label: "· Tentang Layanan", icon: Info },
  { id: "service-proses", label: "· Alur Proses", icon: ProcessIcon },
  { id: "service-persyaratan", label: "· Persyaratan", icon: FileText },
  { id: "service-faq", label: "· Pertanyaan Umum", icon: HelpCircle },
];

const VIEW_STORAGE_KEY = "pintu-legal:service-detail-view";

/**
 * Mini table of contents for service detail pages.
 * Sticky in the sidebar, highlights the current section via IntersectionObserver.
 * Smooth-scrolls to sections on click.
 *
 * In scroll view (when the user has chosen to stack all sections), the
 * sub-section anchors are appended after the "Konten Layanan" item so the
 * user can jump straight to Tentang / Proses / Persyaratan / FAQ.
 */
export function ServiceToc() {
  const [activeId, setActiveId] = React.useState<string>("");
  const [scrollView, setScrollView] = React.useState(false);

  // Sync with the same localStorage key used by ServiceTabs so the TOC
  // knows whether to render the sub-section anchors.
  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(VIEW_STORAGE_KEY);
      setScrollView(stored === "scroll");
    } catch {
      // ignore
    }

    // Listen for storage changes (e.g. when the user toggles the view in
    // the ServiceTabs component). The custom event lets us sync without
    // polling — ServiceTabs dispatches it whenever the view changes.
    const handleStorage = (e: StorageEvent) => {
      if (e.key === VIEW_STORAGE_KEY) {
        setScrollView(e.newValue === "scroll");
      }
    };
    const handleCustom = () => {
      try {
        const stored = window.localStorage.getItem(VIEW_STORAGE_KEY);
        setScrollView(stored === "scroll");
      } catch {
        // ignore
      }
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("service-detail-view-change", handleCustom);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("service-detail-view-change", handleCustom);
    };
  }, []);

  // Build the visible items list. In scroll view, inject the sub-section
  // anchors right after the "Konten Layanan" entry.
  const items = React.useMemo<TocItem[]>(() => {
    if (!scrollView) return BASE_TOC_ITEMS;
    const result: TocItem[] = [];
    for (const item of BASE_TOC_ITEMS) {
      result.push(item);
      if (item.id === "service-tabs") {
        result.push(...SCROLL_SUB_ITEMS);
      }
    }
    return result;
  }, [scrollView]);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 }
    );

    // Observe all TOC target elements that exist on the page.
    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items]);

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const offset = 90; // navbar height
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <nav
      aria-label="Navigasi konten layanan"
      className="rounded-2xl border border-border bg-white p-4 shadow-soft"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-soft">
        Di halaman ini
      </p>
      <ul className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeId === item.id;
          const isSubItem = item.label.startsWith("· ");
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => handleClick(e, item.id)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  isSubItem && "pl-6",
                  isActive
                    ? "bg-gold-50 font-medium text-gold-700 ring-1 ring-gold-200"
                    : "text-ink-soft hover:bg-surface-alt hover:text-navy"
                )}
                aria-current={isActive ? "location" : undefined}
              >
                <Icon
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    isActive ? "text-gold-600" : "text-ink-soft/60"
                  )}
                />
                <span className="truncate">{isSubItem ? item.label.slice(2) : item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
