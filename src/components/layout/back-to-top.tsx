"use client";

import * as React from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

/** Subtle back-to-top button — appears after scrolling past 600px. */
export function BackToTop() {
  const { scrollY } = useScroll();
  const [show, setShow] = React.useState(false);

  useMotionValueEvent(scrollY, "change", (v) => setShow(v > 600));

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.85, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 8 }}
          transition={{ duration: 0.18 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Kembali ke atas"
          className={cn(
            "fixed bottom-24 left-5 z-40 grid h-10 w-10 place-items-center rounded-full",
            "bg-background text-foreground shadow-soft ring-1 ring-border hover:bg-muted",
            "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
          )}
        >
          <ArrowUp className="h-4 w-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
