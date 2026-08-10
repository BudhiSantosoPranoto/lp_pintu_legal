"use client";

import * as React from "react";
import { useInView, useMotionValue, animate, motion } from "framer-motion";

/**
 * Animated number counter that counts up when scrolled into view.
 * Respects prefers-reduced-motion (shows final value instantly).
 */
export function AnimatedCounter({
  value,
  duration = 1.8,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [display, setDisplay] = React.useState(0);
  const motionValue = useMotionValue(0);

  React.useEffect(() => {
    if (!isInView) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) {
      setDisplay(value);
      return;
    }

    const controls = animate(motionValue, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(Math.floor(latest)),
    });

    return () => controls.stop();
  }, [isInView, value, duration, motionValue]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

/** Stats section using AnimatedCounter — numbers are FACTUAL (not invented). */
export function StatsSection({
  stats,
}: {
  stats: { value: number; label: string; suffix?: string; prefix?: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="rounded-2xl border border-border bg-white p-5 text-center shadow-soft sm:p-6"
        >
          <div className="text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
            <AnimatedCounter
              value={stat.value}
              prefix={stat.prefix}
              suffix={stat.suffix}
            />
          </div>
          <div className="mt-1.5 text-xs font-medium uppercase tracking-wider text-ink-soft sm:text-sm">
            {stat.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
