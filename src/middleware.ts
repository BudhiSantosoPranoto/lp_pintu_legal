import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, verifyToken } from "@/lib/auth/cookie";

// Routes that match `/admin` and `/admin/*` EXCEPT `/admin/login`.
function isAdminRoute(pathname: string): boolean {
  if (pathname === "/admin") return true;
  if (pathname.startsWith("/admin/")) return true;
  return false;
}

function isLoginRoute(pathname: string): boolean {
  return pathname === "/admin/login" || pathname.startsWith("/admin/login?");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!isAdminRoute(pathname)) return NextResponse.next();
  if (isLoginRoute(pathname)) return NextResponse.next();

  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const valid = token ? await verifyToken(token) : null;

  if (!valid) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = `?from=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware for /admin and /admin/*
  matcher: ["/admin", "/admin/:path*"],
};
