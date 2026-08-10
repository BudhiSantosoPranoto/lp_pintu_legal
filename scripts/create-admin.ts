/**
 * Bootstrap / update an admin User for PINTU LEGAL.
 *
 * Usage:
 *   bun run scripts/create-admin.ts <email> <password>
 *
 * What it does:
 *   1. Hashes the supplied password with bcryptjs (10 rounds).
 *   2. Upserts the User row (matched by email) with role=ADMIN and the
 *      fresh password hash.
 *
 * NOTE: Requires `DATABASE_URL` to be set in `.env`. Run `bun run db:push`
 * first if the database schema has not been pushed yet.
 *
 * Example:
 *   bun run scripts/create-admin.ts admin@pintulegal.id "s3cret-passphrase"
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const [emailArg, passwordArg] = process.argv.slice(2);

  if (!emailArg || !passwordArg) {
    console.error(
      "Usage: bun run scripts/create-admin.ts <email> <password>"
    );
    process.exit(1);
  }

  const email = emailArg.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error(`Invalid email: "${email}"`);
    process.exit(1);
  }
  if (passwordArg.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(passwordArg, 10);

  const user = await db.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN" },
    create: { email, passwordHash, role: "ADMIN" },
    select: { id: true, email: true, role: true },
  });

  console.log("✓ Admin user saved.");
  console.log(`  id    : ${user.id}`);
  console.log(`  email : ${user.email}`);
  console.log(`  role  : ${user.role}`);
  console.log("");
  console.log("You can now log in at /admin/login.");
}

main()
  .catch((err) => {
    console.error("Failed to create admin:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
