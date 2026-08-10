"use client";

import * as React from "react";
import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Reading progress indicator — a thin gold bar pinned to the top of the
 * viewport that fills as the user scrolls through the article body.
 *
 * The article element is located via the `data-article-content` attribute
 * so this component can stay a self-contained client island without a ref
 * bridge from the server-rendered page.
 *
 * Uses Framer Motion's `useScroll` (with target) + `useSpring` for smooth
 * tracking. Hidden until the article element is mounted.
 */
export function ReadingProgress() {
  const [el, setEl] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    const found = document.querySelector("[data-article-content]");
    if (found instanceof HTMLElement) setEl(found);
  }, []);

  if (!el) return null;
  return <ProgressBar el={el} />;
}

function ProgressBar({ el }: { el: HTMLElement }) {
  // useRef(el) captures the element on first mount; Bar is re-mounted via
  // key when the underlying element changes (it never does in practice).
  const targetRef = React.useRef<HTMLElement>(el);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed left-0 right-0 top-0 z-[55] h-[3px] origin-left bg-gradient-to-r from-gold-600 via-gold to-gold-400"
    />
  );
}
