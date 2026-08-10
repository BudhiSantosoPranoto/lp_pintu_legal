"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "pintu_cookie_consent";

type ConsentValue = "all" | "necessary";

/**
 * Cookie consent banner — slim, non-intrusive bottom bar.
 *
 * Shows on first visit (no localStorage entry). Both buttons persist the
 * choice and dismiss the banner. A small X button allows temporary dismissal
 * (session-only, banner reappears next visit until user makes a choice).
 *
 * Z-index: 60 — above floating WhatsApp (z-50) and back-to-top (z-40).
 * Positioned bottom-center, max-w-3xl, with backdrop blur for premium feel.
 */
export function CookieConsent() {
  const [visible, setVisible] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    setMounted(true);
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) setVisible(true);
    } catch {
      setVisible(false);
    }
  }, []);

  const trackChoice = React.useCallback((choice: "all" | "necessary" | "dismissed") => {
    try {
      fetch("/api/analytics/cookie-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice }),
      }).catch(() => {});
    } catch {
      // Ignore tracking errors
    }
  }, []);

  const persist = React.useCallback((value: ConsentValue) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Ignore write errors
    }
    trackChoice(value);
    setVisible(false);
  }, [trackChoice]);

  const dismissTemporarily = React.useCallback(() => {
    trackChoice("dismissed");
    setVisible(false);
  }, [trackChoice]);

  if (!mounted) return null;

  const enter = reduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 };
  const initial = reduceMotion ? { opacity: 0, y: 0 } : { opacity: 0, y: 100 };
  const exit = reduceMotion ? { opacity: 0, y: 0 } : { opacity: 0, y: 100 };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="cookie-banner"
          initial={initial}
          animate={enter}
          exit={exit}
          transition={{
            duration: reduceMotion ? 0.001 : 0.45,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={cn(
            "fixed bottom-3 left-3 right-20 z-[60] mx-auto max-w-3xl sm:bottom-4 sm:left-4 sm:right-24"
          )}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          role="dialog"
          aria-modal="false"
          aria-label="Pemberitahuan cookie"
          aria-live="polite"
        >
          <div className="relative rounded-2xl border border-border bg-background/95 p-3.5 shadow-soft-lg backdrop-blur-xl sm:p-4">
            {/* Close button — temporary dismiss */}
            <button
              type="button"
              onClick={dismissTemporarily}
              aria-label="Tutup sementara"
              className="absolute right-2 top-2 grid size-7 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-surface-alt hover:text-navy"
            >
              <X className="size-3.5" />
            </button>

            <div className="flex flex-col gap-2.5 pr-7 sm:flex-row sm:items-center sm:gap-4 sm:pr-8">
              <span
                className="hidden size-8 shrink-0 place-items-center rounded-lg bg-gold-50 text-gold-600 ring-1 ring-gold-200 dark:bg-gold/10 dark:text-gold-400 dark:ring-gold/20 sm:grid"
                aria-hidden
              >
                <Cookie className="h-4 w-4" />
              </span>
              <p className="min-w-0 flex-1 text-xs leading-relaxed text-muted-foreground sm:text-[13px]">
                Kami menggunakan cookie untuk meningkatkan pengalaman Anda.{" "}
                <Link
                  href="/privacy-policy"
                  className="font-medium text-gold-600 underline-offset-2 hover:underline dark:text-gold-400"
                >
                  Pelajari lebih lanjut
                </Link>
              </p>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => persist("necessary")}
                  className={cn(
                    "inline-flex h-8 items-center justify-center rounded-lg border border-border bg-transparent px-3 text-xs font-medium",
                    "text-foreground transition-colors hover:bg-muted",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  )}
                >
                  Hanya penting
                </button>
                <button
                  type="button"
                  onClick={() => persist("all")}
                  className={cn(
                    "inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-semibold shadow-soft transition-all hover:shadow-gold",
                    "bg-navy text-white hover:bg-navy-700",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    "dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
                  )}
                >
                  Terima semua
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
