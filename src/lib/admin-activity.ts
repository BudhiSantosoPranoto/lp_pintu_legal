import "server-only";
import { db } from "@/lib/db";

/**
 * Admin Activity Log — best-effort audit trail.
 *
 * Every admin-facing mutation (login, lead update, blog create, etc.) is
 * logged as a row in the `admin_activities` table. Logging is intentionally
 * non-throwing: if the database write fails (or the `AdminActivity` table is
 * unavailable), we swallow the error and return without ever rejecting the
 * caller's promise. The audit log must NEVER be the reason a user-facing
 * operation fails.
 *
 * All logging is fire-and-forget: callers do not need to `await` the result
 * (though they can if they want to). The function always returns a Promise
 * that resolves to `void`.
 */

/** Canonical action keys used in the activity log. */
export const AdminAction = {
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  LEAD_STATUS_UPDATE: "LEAD_STATUS_UPDATE",
  LEAD_DELETE: "LEAD_DELETE",
  LEAD_BULK_UPDATE: "LEAD_BULK_UPDATE",
  LEAD_BULK_DELETE: "LEAD_BULK_DELETE",
  BLOG_CREATE: "BLOG_CREATE",
  BLOG_UPDATE: "BLOG_UPDATE",
  BLOG_DELETE: "BLOG_DELETE",
  SERVICE_CREATE: "SERVICE_CREATE",
  SERVICE_UPDATE: "SERVICE_UPDATE",
  SERVICE_DELETE: "SERVICE_DELETE",
} as const;

export type AdminActionKey = (typeof AdminAction)[keyof typeof AdminAction];

/**
 * Extract the client IP from a `Request`'s headers. Walks the standard
 * forwarded-for chain (`x-forwarded-for`, `x-real-ip`) and returns the first
 * non-empty value. Returns `null` when nothing useful is present.
 */
export function getRequestIp(req: Request): string | null {
  const headers = req.headers;
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const xRealIp = headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();
  return null;
}

/**
 * Persist a single admin-activity row.
 *
 * @param email     Admin email (already normalised to lowercase by caller).
 * @param action    One of the {@link AdminAction} keys.
 * @param entityType Optional entity kind (e.g. "lead", "blog_post").
 * @param entityId   Optional entity ID.
 * @param detail     Optional JSON-serialisable object describing the action.
 * @param ipAddress  Optional client IP (extracted from the request by the
 *                   caller via {@link getRequestIp}).
 */
export async function logAdminActivity(
  email: string,
  action: string,
  entityType?: string | null,
  entityId?: string | null,
  detail?: Record<string, unknown> | null,
  ipAddress?: string | null
): Promise<void> {
  try {
    const cleanEmail = (email ?? "").trim().toLowerCase();
    if (!cleanEmail) return;

    const detailStr =
      detail && Object.keys(detail).length > 0
        ? JSON.stringify(detail)
        : null;

    await db.adminActivity.create({
      data: {
        adminEmail: cleanEmail,
        action,
        entityType: entityType ?? null,
        entityId: entityId ?? null,
        detail: detailStr,
        ipAddress: ipAddress ?? null,
      },
    });
  } catch (err) {
    // Never let audit-log failures surface to the user. We still log to the
    // server console for debugging.
    console.error("[admin-activity] failed to log", action, err);
  }
}
