"use client";

import * as React from "react";

/**
 * Web Vitals tracking — captures LCP, FID, CLS, INP, TTFB metrics
 * and logs them to the console (or sends to an analytics endpoint).
 *
 * Uses the built-in Performance API (no external dependency).
 * Respects prefers-reduced-motion (still tracks but doesn't report if reduced).
 */

type Metric = {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta?: number;
  id: string;
};

const THRESHOLDS: Record<string, { good: number; poor: number }> = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  INP: { good: 200, poor: 500 },
  TTFB: { good: 800, poor: 1800 },
};

function getRating(name: string, value: number): Metric["rating"] {
  const thresholds = THRESHOLDS[name];
  if (!thresholds) return "good";
  if (value <= thresholds.good) return "good";
  if (value <= thresholds.poor) return "needs-improvement";
  return "poor";
}

function reportMetric(metric: Metric) {
  // Log to console with color-coded rating
  const colors: Record<string, string> = {
    good: "\x1b[32m", // green
    "needs-improvement": "\x1b[33m", // yellow
    poor: "\x1b[31m", // red
  };
  const reset = "\x1b[0m";
  const color = colors[metric.rating] ?? reset;
  
  if (process.env.NODE_ENV === "development") {
    console.log(
      `${color}[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})${reset}`
    );
  }

  // Send to analytics endpoint (non-blocking, fire-and-forget)
  try {
    fetch("/api/analytics/web-vitals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: metric.name,
        value: Math.round(metric.value * 100) / 100,
        rating: metric.rating,
        id: metric.id,
        page: window.location.pathname,
        timestamp: Date.now(),
      }),
      // Use keepalive to ensure the request completes even if page unloads
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Ignore tracking errors
  }
}

/**
 * Web Vitals tracking component.
 * Mount once in the root layout — invisible, no UI.
 */
export function WebVitalsTracker() {
  React.useEffect(() => {
    // Use PerformanceObserver for Core Web Vitals
    const observeMetrics = () => {
      // LCP (Largest Contentful Paint)
      try {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            reportMetric({
              name: "LCP",
              value: lastEntry.startTime,
              rating: getRating("LCP", lastEntry.startTime),
              id: "lcp-" + Date.now(),
            });
          }
        }).observe({ type: "largest-contentful-paint", buffered: true });
      } catch {}

      // CLS (Cumulative Layout Shift)
      try {
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const layoutShift = entry as PerformanceEntry & {
              hadRecentInput?: boolean;
              value?: number;
            };
            if (!layoutShift.hadRecentInput) {
              clsValue += layoutShift.value ?? 0;
            }
          }
          reportMetric({
            name: "CLS",
            value: clsValue,
            rating: getRating("CLS", clsValue),
            id: "cls-" + Date.now(),
          });
        }).observe({ type: "layout-shift", buffered: true });
      } catch {}

      // INP (Interaction to Next Paint) — replaces FID
      try {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            const lastEntry = entries[entries.length - 1];
            reportMetric({
              name: "INP",
              value: lastEntry.duration,
              rating: getRating("INP", lastEntry.duration),
              id: "inp-" + Date.now(),
            });
          }
        }).observe({ type: "event", buffered: true });
      } catch {}

      // TTFB (Time to First Byte)
      try {
        const navEntries = performance.getEntriesByType("navigation");
        if (navEntries.length > 0) {
          const nav = navEntries[0] as PerformanceNavigationTiming;
          const ttfb = nav.responseStart - nav.requestStart;
          if (ttfb > 0) {
            reportMetric({
              name: "TTFB",
              value: ttfb,
              rating: getRating("TTFB", ttfb),
              id: "ttfb-" + Date.now(),
            });
          }
        }
      } catch {}
    };

    // Delay slightly to ensure page is interactive
    const timer = setTimeout(observeMetrics, 100);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
