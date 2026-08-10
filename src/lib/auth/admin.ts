import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import {
  ADMIN_COOKIE_NAME,
  signToken,
  verifyToken,
} from "@/lib/auth/cookie";

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ─── Password helpers ──────────────────────────────────────────────────────

/** Hash a plaintext password with bcrypt (10 rounds). */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

/** Verify a plaintext password against a bcrypt hash. */
export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

// ─── Session helpers ────────────────────────────────────────────────────────

/** Create a signed session cookie for the given admin email. */
export async function createAdminSession(email: string): Promise<void> {
  const token = await signToken({ email, exp: Date.now() + SESSION_TTL_MS });
  const store = await cookies();
  store.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
}

/** Read & verify the session cookie. Returns null if missing/invalid/expired. */
export async function getAdminSession(): Promise<{
  email: string;
} | null> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  return { email: payload.email };
}

/** Clear the session cookie. */
export async function clearAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE_NAME);
}

/**
 * Server-only guard for admin pages / actions. Throws a redirect to
 * `/admin/login` (preserving `?from=`) if no valid session exists.
 * Returns the session user otherwise.
 */
export async function requireAdmin(): Promise<{ email: string }> {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

/**
 * Authenticate an email + password combo against the database (and an
 * optional env-based fallback). Returns true on success, false otherwise.
 *
 * Resolution order:
 *   1. If `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH` env vars are set and the
 *      submitted email matches `ADMIN_EMAIL`, verify against the env hash
 *      (skips DB lookup — useful for dev / single-admin setups).
 *   2. Otherwise, look up the User row by email and verify with bcrypt.
 */
export async function authenticateAdmin(
  email: string,
  password: string
): Promise<boolean> {
  const normalized = email.trim().toLowerCase();

  // 1) Env-based admin (dev convenience)
  const envEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const envHash = process.env.ADMIN_PASSWORD_HASH;
  if (envEmail && envHash && normalized === envEmail) {
    return verifyPassword(password, envHash);
  }

  // 2) Database lookup
  const user = await db.user.findUnique({
    where: { email: normalized },
    select: { passwordHash: true, role: true },
  });
  if (!user) return false;
  if (user.role !== "ADMIN") return false;
  return verifyPassword(password, user.passwordHash);
}
