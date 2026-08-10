import * as React from "react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { FloatingWhatsApp } from "./floating-whatsapp";
import { BackToTop } from "./back-to-top";
import { CookieConsent } from "./cookie-consent";

/**
 * Standard site shell for all public marketing pages.
 * Provides sticky navbar, sticky footer, floating WhatsApp + back-to-top,
 * and a one-time cookie consent banner.
 */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingWhatsApp />
      <BackToTop />
      <CookieConsent />
    </div>
  );
}
