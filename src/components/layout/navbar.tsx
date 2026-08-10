"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X, MessageCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig, waLink } from "@/lib/site";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => {
    setScrolled(v > 12);
  });

  // Close mobile sheet on route change
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border/70 bg-background/85 backdrop-blur-xl shadow-[0_4px_24px_-12px_rgba(15,39,71,0.18)]"
          : "border-b border-transparent bg-background/0"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8 lg:h-[72px]">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-gold/60"
          aria-label="Pintu Legal — Beranda"
        >
          <Logo />
        </Link>

        {/* Desktop nav */}
        <nav
          aria-label="Navigasi utama"
          className="hidden items-center gap-1 lg:flex"
        >
          {siteConfig.nav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors outline-none",
                  active
                    ? "text-navy dark:text-foreground"
                    : "text-ink-soft hover:text-navy dark:text-muted-foreground dark:hover:text-foreground"
                )}
              >
                {item.label}
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-gold"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-navy hover:bg-navy-50 hover:text-navy dark:text-foreground dark:hover:bg-white/5"
          >
            <a
              href={waLink("Halo Pintu Legal, saya ingin berkonsultasi mengenai legalitas bisnis.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </a>
          </Button>
          <Button
            asChild
            size="sm"
            className="bg-navy text-white shadow-soft hover:bg-navy-700"
          >
            <Link href="/kontak">
              Konsultasi Gratis
              <ChevronRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Mobile menu trigger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-navy"
              aria-label="Buka menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[88vw] max-w-sm border-l-border bg-background p-0"
          >
            <SheetHeader className="border-b border-border px-5 py-4 text-left">
              <div className="flex items-center justify-between">
                <SheetTitle className="p-0">
                  <Logo />
                </SheetTitle>
                <span className="sr-only">Pintu Legal navigation</span>
              </div>
            </SheetHeader>

            <nav className="flex flex-col px-3 py-4" aria-label="Navigasi mobile">
              {siteConfig.nav.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3 py-3 text-base font-medium transition-colors",
                      active
                        ? "bg-navy-50 text-navy dark:bg-white/5 dark:text-foreground"
                        : "text-ink hover:bg-surface-alt hover:text-navy dark:text-foreground/90 dark:hover:bg-white/5"
                    )}
                  >
                    {item.label}
                    <ChevronRight className={cn("h-4 w-4", active ? "text-gold" : "text-ink-soft/60")} />
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto space-y-2 border-t border-border px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink-soft dark:text-muted-foreground">
                  Tema
                </span>
                <ThemeToggle />
              </div>
              <Button
                asChild
                className="w-full bg-navy text-white hover:bg-navy-700"
              >
                <Link href="/kontak">
                  Konsultasi Gratis
                  <ChevronRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full border-navy/20 text-navy hover:bg-navy-50 dark:border-white/15 dark:text-foreground dark:hover:bg-white/5"
              >
                <a
                  href={waLink("Halo Pintu Legal, saya ingin berkonsultasi mengenai legalitas bisnis.")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Chat via WhatsApp
                </a>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
