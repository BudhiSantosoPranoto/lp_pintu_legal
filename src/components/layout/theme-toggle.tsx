"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Theme toggle — switches between light and dark.
 *
 * Uses next-themes `useTheme()`. Renders a placeholder button until mounted
 * to avoid hydration mismatch (theme is only known client-side).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      suppressHydrationWarning
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      aria-pressed={isDark}
      title={isDark ? "Mode terang" : "Mode gelap"}
      className={cn(
        "inline-grid size-9 place-items-center rounded-lg text-foreground transition-colors outline-none",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      )}
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-[1.15rem] w-[1.15rem]" aria-hidden />
        ) : (
          <Moon className="h-[1.15rem] w-[1.15rem]" aria-hidden />
        )
      ) : (
        // Static placeholder to prevent layout shift before mount.
        <Sun className="h-[1.15rem] w-[1.15rem] opacity-0" aria-hidden />
      )}
    </button>
  );
}
