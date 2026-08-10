import { NextResponse } from "next/server";
import { clearAdminSession, getAdminSession } from "@/lib/auth/admin";
import { logAdminActivity } from "@/lib/admin-activity";

export async function POST() {
  // Optional: verify session exists — but always clear cookie regardless.
  const session = await getAdminSession();
  await clearAdminSession();

  // Fire-and-forget audit log — only when there was actually a session to
  // log out of. Non-throwing by design.
  if (session?.email) {
    void logAdminActivity(session.email, "LOGOUT");
  }

  return NextResponse.json({ ok: true, wasLoggedIn: !!session });
}
