import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  choice: z.enum(["all", "necessary", "dismissed"]),
  userAgent: z.string().optional(),
});

/**
 * Track cookie consent choices for analytics.
 * Stores in SiteSetting with key "cookie_consent_analytics" as a JSON aggregate.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 422 });
  }

  const { choice } = parsed.data;

  try {
    const existing = await db.siteSetting.findUnique({
      where: { key: "cookie_consent_analytics" },
    });

    let analytics = { all: 0, necessary: 0, dismissed: 0, total: 0 };
    if (existing?.value) {
      try {
        analytics = JSON.parse(existing.value);
      } catch {
        // Reset if corrupt
      }
    }

    analytics[choice] = (analytics[choice] ?? 0) + 1;
    analytics.total = (analytics.total ?? 0) + 1;

    await db.siteSetting.upsert({
      where: { key: "cookie_consent_analytics" },
      update: { value: JSON.stringify(analytics) },
      create: { key: "cookie_consent_analytics", value: JSON.stringify(analytics) },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[cookie-analytics] failed", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

/** GET — return current consent analytics. */
export async function GET() {
  try {
    const setting = await db.siteSetting.findUnique({
      where: { key: "cookie_consent_analytics" },
    });
    if (!setting?.value) {
      return NextResponse.json({ all: 0, necessary: 0, dismissed: 0, total: 0 });
    }
    return NextResponse.json(JSON.parse(setting.value));
  } catch {
    return NextResponse.json({ all: 0, necessary: 0, dismissed: 0, total: 0 });
  }
}
