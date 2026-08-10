import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateAdmin, createAdminSession } from "@/lib/auth/admin";
import { logAdminActivity, getRequestIp } from "@/lib/admin-activity";

const schema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Kata sandi wajib diisi").max(200),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Format permintaan tidak valid" },
      { status: 400 }
    );
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Email atau kata sandi tidak valid" },
      { status: 422 }
    );
  }

  const ok = await authenticateAdmin(parsed.data.email, parsed.data.password);
  if (!ok) {
    return NextResponse.json(
      { error: "Email atau kata sandi salah" },
      { status: 401 }
    );
  }

  const email = parsed.data.email.trim().toLowerCase();
  await createAdminSession(email);

  // Fire-and-forget audit log — non-blocking, never throws.
  void logAdminActivity(
    email,
    "LOGIN",
    null,
    null,
    null,
    getRequestIp(req)
  );

  return NextResponse.json({ ok: true });
}
