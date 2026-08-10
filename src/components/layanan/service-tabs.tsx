"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlignJustify, HelpCircle, Info, LayoutGrid, ListChecks, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TentangTab,
  ProsesTab,
  PersyaratanTab,
  FaqTab,
} from "@/components/layanan/service-tab-panels";

export type ServiceTabFaq = { q: string; a: string };

export type ServiceTabsProps = {
  description: string;
  highlights: string[];
  processSteps: string[];
  requirements: string[];
  faqs: ServiceTabFaq[];
  audience: string[];
};

type TabKey = "tentang" | "proses" | "persyaratan" | "faq";
type ViewMode = "tab" | "scroll";

const TAB_LABELS: Record<TabKey, string> = {
  tentang: "Tentang",
  proses: "Proses",
  persyaratan: "Persyaratan",
  faq: "FAQ",
};

const TAB_ICONS: Record<TabKey, React.ComponentType<{ className?: string }>> = {
  tentang: Info,
  proses: ListChecks,
  persyaratan: FileText,
  faq: HelpCircle,
};

/** Anchor IDs used by the table of contents in scroll view. */
const SECTION_ANCHORS: Record<TabKey, string> = {
  tentang: "service-tentang",
  proses: "service-proses",
  persyaratan: "service-persyaratan",
  faq: "service-faq",
};

const VIEW_STORAGE_KEY = "pintu-legal:service-detail-view";

/**
 * Service detail tabs — converts the previously-long-scroll service detail
 * body into a sticky tabbed interface, with an optional "Scroll View" mode
 * that stacks every section vertically in a single page.
 *
 * Tabs (Tab View): "Tentang", "Proses", "Persyaratan", "FAQ". The FAQ tab
 * is always present; when the service carries no faqsJson data it falls
 * back to a friendly empty state with a link to the global /faq page.
 *
 * Scroll View: hides the tab navigation and renders all four sections
 * stacked vertically with section headings + anchor IDs so the sidebar
 * TOC can deep-link into each section.
 *
 * The view preference is persisted in localStorage so users get the same
 * experience on subsequent visits.
 *
 * Keyboard: ArrowLeft / ArrowRight move between tabs (roving tabindex).
 */
export function ServiceTabs({
  description,
  highlights,
  processSteps,
  requirements,
  faqs,
  audience,
}: ServiceTabsProps) {
  // All four tabs are always rendered; the FAQ tab shows an empty state
  // with a link to /faq when the service has no FAQs of its own.
  const tabs = React.useMemo<TabKey[]>(
    () => ["tentang", "proses", "persyaratan", "faq"],
    []
  );

  const [active, setActive] = React.useState<TabKey>("tentang");
  const [view, setView] = React.useState<ViewMode>("tab");
  const [mounted, setMounted] = React.useState(false);
  const tablistRef = React.useRef<HTMLDivElement>(null);

  // Restore persisted view preference on mount. We deliberately start with
  // "tab" (SSR-safe default) and only switch after mount to avoid hydration
  // mismatches.
  React.useEffect(() => {
    setMounted(true);
    try {
      const stored = window.localStorage.getItem(VIEW_STORAGE_KEY);
      if (stored === "scroll" || stored === "tab") {
        setView(stored);
      }
    } catch {
      // localStorage unavailable — fall back to default.
    }
  }, []);

  // Persist view preference whenever it changes (after mount only).
  // Also dispatch a custom event so the sidebar TOC can re-render its
  // sub-section anchors in sync (the storage event only fires across
  // tabs/windows, not within the same document).
  React.useEffect(() => {
    if (!mounted) return;
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, view);
    } catch {
      // localStorage unavailable — ignore.
    }
    window.dispatchEvent(
      new CustomEvent("service-detail-view-change", { detail: { view } })
    );
  }, [view, mounted]);

  // Keyboard navigation: ArrowLeft / ArrowRight move between tabs and
  // focus the newly-active tab. Home/End jump to first/last.
  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const idx = tabs.indexOf(active);
      let nextIdx: number | null = null;
      if (e.key === "ArrowRight") nextIdx = (idx + 1) % tabs.length;
      else if (e.key === "ArrowLeft")
        nextIdx = (idx - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") nextIdx = 0;
      else if (e.key === "End") nextIdx = tabs.length - 1;

      if (nextIdx === null) return;
      e.preventDefault();
      const target = tabs[nextIdx];
      setActive(target);
      requestAnimationFrame(() => {
        const btn = tablistRef.current?.querySelector<HTMLButtonElement>(
          `[data-tab-key="${target}"]`
        );
        btn?.focus();
      });
    },
    [tabs, active]
  );

  return (
    <div>
      {/* View mode toggle — floats at the top right of the tab bar */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="hidden text-xs font-medium text-ink-soft sm:block">
          {view === "tab"
            ? "Mode tab — pilih bagian untuk membaca."
            : "Mode gulir — semua bagian dalam satu halaman."}
        </p>
        <ViewToggle
          value={view}
          onChange={setView}
          // Disable until mounted to avoid hydration mismatch on the active
          // state styling.
          disabled={!mounted}
        />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {view === "tab" ? (
          <motion.div
            key="tab-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {/* Sticky tab bar */}
            <div className="sticky top-16 z-20 -mx-5 mb-10 bg-background/95 px-5 backdrop-blur sm:-mx-6 sm:px-6 lg:top-[72px] lg:mx-0 lg:px-0">
              <div
                ref={tablistRef}
                role="tablist"
                aria-label="Bagian detail layanan"
                aria-orientation="horizontal"
                onKeyDown={onKeyDown}
                className="no-scrollbar flex gap-1 overflow-x-auto border-b border-border"
              >
                {tabs.map((key) => {
                  const isActive = active === key;
                  const Icon = TAB_ICONS[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      role="tab"
                      data-tab-key={key}
                      id={`service-tab-${key}`}
                      aria-selected={isActive}
                      aria-controls={`service-tabpanel-${key}`}
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => setActive(key)}
                      className={cn(
                        "relative flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-inset",
                        isActive
                          ? "text-navy dark:text-foreground"
                          : "text-ink-soft hover:text-navy dark:text-muted-foreground dark:hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{TAB_LABELS[key]}</span>
                      {isActive && (
                        <>
                          <motion.span
                            aria-hidden
                            layoutId="service-tab-accent"
                            className="absolute -top-px left-3 right-3 h-0.5 rounded-full bg-gold"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                          <motion.span
                            aria-hidden
                            layoutId="service-tab-underline"
                            className="absolute inset-x-3 -bottom-px h-[3px] rounded-full bg-navy dark:bg-foreground"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab content with fade transition */}
            <div className="focus-visible:outline-none">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  role="tabpanel"
                  id={`service-tabpanel-${active}`}
                  aria-labelledby={`service-tab-${active}`}
                  tabIndex={0}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="focus-visible:outline-none"
                >
                  {active === "tentang" && (
                    <TentangTab
                      description={description}
                      highlights={highlights}
                    />
                  )}
                  {active === "proses" && <ProsesTab processSteps={processSteps} />}
                  {active === "persyaratan" && (
                    <PersyaratanTab
                      requirements={requirements}
                      audience={audience}
                    />
                  )}
                  {active === "faq" && <FaqTab faqs={faqs} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="scroll-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="space-y-14"
          >
            <ScrollSection id={SECTION_ANCHORS.tentang}>
              <TentangTab description={description} highlights={highlights} />
            </ScrollSection>
            <ScrollSection id={SECTION_ANCHORS.proses}>
              <ProsesTab processSteps={processSteps} />
            </ScrollSection>
            <ScrollSection id={SECTION_ANCHORS.persyaratan}>
              <PersyaratanTab requirements={requirements} audience={audience} />
            </ScrollSection>
            <ScrollSection id={SECTION_ANCHORS.faq}>
              <FaqTab faqs={faqs} />
            </ScrollSection>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── View toggle ─────────────────────────────────────────────────────────────

function ViewToggle({
  value,
  onChange,
  disabled,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
  disabled?: boolean;
}) {
  return (
    <div
      role="group"
      aria-label="Mode tampilan detail layanan"
      className="inline-flex items-center rounded-full border border-border bg-surface-alt p-1 shadow-soft"
    >
      <ToggleBtn
        active={value === "tab"}
        onClick={() => onChange("tab")}
        label="Mode Tab"
        icon={<LayoutGrid className="h-3.5 w-3.5" />}
        disabled={disabled}
      />
      <ToggleBtn
        active={value === "scroll"}
        onClick={() => onChange("scroll")}
        label="Mode Gulir"
        icon={<AlignJustify className="h-3.5 w-3.5" />}
        disabled={disabled}
      />
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  label,
  icon,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-gold/50",
        active
          ? "bg-navy text-white shadow-soft"
          : "text-ink-soft hover:text-navy dark:text-muted-foreground dark:hover:text-foreground",
        disabled && "cursor-not-allowed opacity-60"
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// ─── Scroll view wrapper ──────────────────────────────────────────────────────

/**
 * Wraps a tab panel with an anchor id + scroll-margin so the sidebar TOC can
 * deep-link into each section when in scroll view.
 */
function ScrollSection({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-32">
      {children}
    </section>
  );
}
