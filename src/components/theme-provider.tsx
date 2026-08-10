"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Wraps next-themes ThemeProvider.
 *
 * Default theme is "light" (PINTU LEGAL brand default). System preference is
 * intentionally disabled so the brand experience is consistent on first visit;
 * users can still toggle manually via <ThemeToggle />.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
