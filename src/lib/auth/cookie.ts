/**
 * Edge-safe HMAC token signing/verification for the admin session.
 *
 * This module MUST NOT import any Node-only APIs (no `next/headers`,
 * no `bcryptjs`, no `fs`). It is imported by `src/middleware.ts`, which
 * runs on the Edge runtime.
 *
 * The token format is: `<base64url(payload)>.<base64url(hmac-sha256(payload))>`
 * where payload is `{ email, exp }` (exp = epoch ms).
 */

export const ADMIN_COOKIE_NAME = "pintu_admin";
const ALG = "HMAC";
const HASH = "SHA-256";
const DEV_SECRET =
  "pintu-legal-dev-insecure-secret-please-set-AUTH_SECRET-in-production";

/**
 * Returns the AUTH_SECRET, falling back to a clearly-warned dev default.
 * The dev default is intentionally insecure so that bootstrapping admin
 * in a sandbox "just works" — it MUST be replaced via env in production.
 */
export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    // Only warn once per process — keep a module-level guard.
    if (!devWarningShown) {
      console.warn(
        "[auth] AUTH_SECRET not set — using insecure dev default. " +
          "Set AUTH_SECRET in production!"
      );
      devWarningShown = true;
    }
    return DEV_SECRET;
  }
  return secret;
}

let devWarningShown = false;

function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: ALG, hash: HASH },
    false,
    ["sign", "verify"]
  );
}

function toBase64Url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export interface AdminTokenPayload {
  email: string;
  exp: number; // epoch ms
}

export async function signToken(payload: AdminTokenPayload): Promise<string> {
  const body = toBase64Url(
    new TextEncoder().encode(JSON.stringify(payload))
  );
  const key = await importKey(getAuthSecret());
  const sig = await crypto.subtle.sign(
    ALG,
    key,
    new TextEncoder().encode(body)
  );
  return `${body}.${toBase64Url(new Uint8Array(sig))}`;
}

/**
 * Verify a token's HMAC signature and expiry. Returns the payload or null.
 * Safe to call in middleware (edge) and in server components / route handlers.
 */
export async function verifyToken(
  token: string
): Promise<AdminTokenPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  if (!body || !sig) return null;
  try {
    const key = await importKey(getAuthSecret());
    const sigBytes = fromBase64Url(sig);
    const ok = await crypto.subtle.verify(
      ALG,
      key,
      sigBytes,
      new TextEncoder().encode(body)
    );
    if (!ok) return null;
    const json = new TextDecoder().decode(fromBase64Url(body));
    const payload = JSON.parse(json) as AdminTokenPayload;
    if (
      typeof payload?.email !== "string" ||
      typeof payload?.exp !== "number" ||
      Date.now() > payload.exp
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
