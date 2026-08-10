import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  name: z.string(),
  value: z.number(),
  rating: z.enum(["good", "needs-improvement", "poor"]),
  id: z.string(),
  page: z.string(),
  timestamp: z.number(),
});

/**
 * Track Web Vitals metrics.
 * Stores aggregate stats in site_settings under "web_vitals_analytics".
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

  const { name, value, rating, page } = parsed.data;

  try {
    const existing = await db.siteSetting.findUnique({
      where: { key: "web_vitals_analytics" },
    });

    let analytics: Record<string, unknown> = {
      metrics: {},
      totalReports: 0,
      lastUpdated: Date.now(),
    };

    if (existing?.value) {
      try {
        analytics = JSON.parse(existing.value);
      } catch {
        // Reset if corrupt
      }
    }

    const metrics = (analytics.metrics as Record<string, { count: number; avgValue: number; good: number; poor: number; samples: { page: string; value: number; rating: string; ts: number }[] }>) || {};
    
    if (!metrics[name]) {
      metrics[name] = { count: 0, avgValue: 0, good: 0, poor: 0, samples: [] };
    }

    const m = metrics[name];
    m.count = (m.count ?? 0) + 1;
    m.avgValue = ((m.avgValue ?? 0) * (m.count - 1) + value) / m.count;
    if (rating === "good") m.good = (m.good ?? 0) + 1;
    if (rating === "poor") m.poor = (m.poor ?? 0) + 1;
    
    // Keep last 20 samples
    m.samples = [...(m.samples ?? []), { page, value, rating, ts: Date.now() }].slice(-20);

    analytics.metrics = metrics;
    analytics.totalReports = (analytics.totalReports as number) + 1;
    analytics.lastUpdated = Date.now();

    await db.siteSetting.upsert({
      where: { key: "web_vitals_analytics" },
      update: { value: JSON.stringify(analytics) },
      create: { key: "web_vitals_analytics", value: JSON.stringify(analytics) },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[web-vitals] tracking failed", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

/** GET — return current Web Vitals analytics. */
export async function GET() {
  try {
    const setting = await db.siteSetting.findUnique({
      where: { key: "web_vitals_analytics" },
    });
    if (!setting?.value) {
      return NextResponse.json({ metrics: {}, totalReports: 0 });
    }
    return NextResponse.json(JSON.parse(setting.value));
  } catch {
    return NextResponse.json({ metrics: {}, totalReports: 0 });
  }
}
