"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  Briefcase,
  Newspaper,
  HelpCircle,
  Quote,
  Settings,
  LogOut,
  Menu,
  ShieldCheck,
  Loader2,
  ExternalLink,
  History,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Match prefix (e.g. /admin/leads matches /admin/leads/xyz) */
  exact?: boolean;
};

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Leads", href: "/admin/leads", icon: Inbox },
  { label: "Layanan", href: "/admin/services", icon: Briefcase },
  { label: "Blog", href: "/admin/blog", icon: Newspaper },
  { label: "FAQ", href: "/admin/faqs", icon: HelpCircle },
  { label: "Testimoni", href: "/admin/testimonials", icon: Quote },
  { label: "Aktivitas", href: "/admin/aktivitas", icon: History },
  { label: "Pengaturan", href: "/admin/settings", icon: Settings },
];

function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(item.href + "/");
}

function NavLinks({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Navigasi admin" className="flex flex-col gap-1 px-3">
      {NAV.map((item) => {
        const active = isActive(pathname, item);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-white/10 text-white ring-1 ring-gold/40"
                : "text-white/65 hover:text-white hover:bg-white/5"
            )}
          >
            <Icon
              className={cn(
                "size-4 shrink-0 transition-colors",
                active ? "text-gold" : "text-white/55 group-hover:text-gold/80"
              )}
            />
            <span>{item.label}</span>
            {active && (
              <span className="ml-auto size-1.5 rounded-full bg-gold" aria-hidden />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function BrandHeader() {
  return (
    <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
      <Image
        src="/images/pintu-legal-icon.png"
        alt="Pintu Legal"
        width={36}
        height={36}
        className="size-9 shrink-0 object-contain"
        priority
      />
      <div className="leading-tight">
        <div className="text-white font-bold text-sm tracking-tight">
          PINTU <span className="text-gold">LEGAL</span>
        </div>
        <div className="text-white/50 text-[11px]">Admin Console</div>
      </div>
    </div>
  );
}

function LogoutButton({ onDone }: { onDone?: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  async function handleLogout() {
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      /* ignore — we still navigate away */
    }
    onDone?.();
    // Hard navigate so middleware re-evaluates the cleared cookie.
    window.location.href = "/admin/login";
  }

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      disabled={loading}
      className="w-full justify-start gap-2.5 text-white/60 hover:text-white hover:bg-white/5 hover:bg-destructive/15 hover:text-destructive-foreground h-10 shrink-0 whitespace-nowrap"
    >
      {loading ? (
        <Loader2 className="size-4 shrink-0" />
      ) : (
        <LogOut className="size-4 shrink-0" />
      )}
      <span className="truncate">Keluar</span>
    </Button>
  );
}

export function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Close drawer on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const currentNav =
    NAV.find((n) => isActive(pathname, n)) ?? NAV[0];

  return (
    <div className="min-h-screen bg-surface-alt flex">
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex lg:flex-col w-64 shrink-0 bg-navy text-white sticky top-0 h-screen"
        aria-label="Sidebar admin"
      >
        <BrandHeader />
        <div className="flex-1 overflow-y-auto py-4 no-scrollbar">
          <NavLinks pathname={pathname} />
        </div>
        <div className="px-3 py-4 border-t border-white/10 space-y-3">
          <div className="px-3 py-2 rounded-lg bg-white/5 text-xs">
            <div className="text-white/40">Masuk sebagai</div>
            <div className="text-white font-medium truncate" title={email}>
              {email}
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <button
            className="lg:hidden fixed top-3 left-3 z-30 inline-flex items-center justify-center size-10 rounded-lg bg-navy text-white shadow-soft"
            aria-label="Buka menu navigasi"
          >
            <Menu className="size-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 bg-navy text-white border-0">
          <SheetHeader className="p-0 text-left">
            <SheetTitle className="sr-only">Navigasi admin</SheetTitle>
            <BrandHeader />
          </SheetHeader>
          <div className="flex-1 overflow-y-auto py-4">
            <NavLinks pathname={pathname} />
          </div>
          <div className="px-3 py-4 border-t border-white/10 space-y-3">
            <div className="px-3 py-2 rounded-lg bg-white/5 text-xs">
              <div className="text-white/40">Masuk sebagai</div>
              <div className="text-white font-medium truncate" title={email}>
                {email}
              </div>
            </div>
            <LogoutButton />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-border">
          <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-8 h-14 pl-16 lg:pl-8">
            <div className="flex items-center gap-2 min-w-0">
              <currentNav.icon className="size-4 text-gold-600 shrink-0" />
              <h1 className="text-sm font-semibold text-ink truncate">
                {currentNav.label}
              </h1>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft hover:text-navy transition-colors"
              >
                Lihat situs
                <ExternalLink className="size-3.5" />
              </Link>
              <span className="hidden md:inline text-xs text-ink-soft">
                {email}
              </span>
            </div>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
