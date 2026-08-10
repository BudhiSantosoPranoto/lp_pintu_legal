"use client";

import * as React from "react";
import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Reading progress bar for service detail pages.
 * Shows a thin gold gradient bar at the top of the viewport that fills
 * as the user scrolls through the service content.
 * Tracks the main content element via data attribute.
 */
export function ServiceReadingProgress() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [targetEl, setTargetEl] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    // Find the main content area (the body section with service-tabs)
    const el = document.getElementById("service-tabs");
    if (el) setTargetEl(el);
  }, []);

  const { scrollYProgress } = useScroll({
    target: targetEl ? { current: targetEl } : undefined,
    offset: ["start start", "end end"],
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });

  if (!targetEl) return null;

  return (
    <motion.div
      ref={ref}
      className="fixed left-0 right-0 top-0 z-[55] h-1 origin-left bg-gradient-to-r from-gold-400 via-gold to-gold-600"
      style={{ scaleX }}
      aria-hidden
    />
  );
}
