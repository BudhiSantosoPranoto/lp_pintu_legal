import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendLeadNotification } from "@/lib/notifications";

const schema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(120),
  phone: z
    .string()
    .min(7, "Nomor WhatsApp tidak valid")
    .max(25)
    .regex(/^[0-9+\-\s]+$/, "Nomor WhatsApp hanya boleh berisi angka"),
  email: z
    .string()
    .max(120)
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || z.string().email().safeParse(v).success, {
      message: "Email tidak valid",
    }),
  serviceId: z.string().optional().or(z.literal("")),
  businessName: z.string().max(120).optional().or(z.literal("")),
  message: z.string().min(5, "Pesan minimal 5 karakter").max(2000),
  // Honeypot field — must remain empty for legitimate submissions
  website: z.string().max(0).optional().or(z.literal("")),
});

// ─── In-memory rate limit (per IP, 5 req / 10 min) ───────────────────────
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQ = 5;
const hits = new Map<string, { count: number; firstHit: number }>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.firstHit > WINDOW_MS) {
    hits.set(ip, { count: 1, firstHit: now });
    return true;
  }
  if (entry.count >= MAX_REQ) return false;
  entry.count += 1;
  return true;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (!rateLimit(ip)) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi nanti." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format permintaan tidak valid" }, { status: 400 });
  }

  // Honeypot: any value here = spam bot
  const raw = (body ?? {}) as Record<string, unknown>;
  if (typeof raw.website === "string" && raw.website.length > 0) {
    // Pretend success to not tip off the bot
    return NextResponse.json({ ok: true, id: "honeypot" });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validasi gagal", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { name, phone, email, serviceId, businessName, message } = parsed.data;

  try {
    const lead = await db.lead.create({
      data: {
        name,
        phone,
        email: email || null,
        serviceId: serviceId || null,
        businessName: businessName || null,
        message,
        status: "NEW",
        source: "WEBSITE",
      },
      include: {
        service: { select: { name: true } },
      },
    });

    // Fire-and-forget notification. We intentionally do NOT await — the
    // public lead submission must stay fast even if the webhook is slow
    // or unreachable. Any error is swallowed inside the helper.
    void sendLeadNotification({
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      businessName: lead.businessName,
      serviceId: lead.serviceId,
      serviceName: lead.service?.name ?? null,
      message: lead.message,
      source: lead.source,
      status: lead.status,
      createdAt: lead.createdAt,
    }).catch((err) => {
      console.warn("[leads] notification failed silently:", err);
    });

    return NextResponse.json({ ok: true, id: lead.id });
  } catch (err) {
    console.error("[leads] create failed", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
