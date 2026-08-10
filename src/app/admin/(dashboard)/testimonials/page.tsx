import { db } from "@/lib/db";
import { TestimonialsTable } from "@/components/admin/testimonials-table";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const testimonials = await db.testimonial.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  const safe = testimonials.map((t) => ({
    id: t.id,
    name: t.name,
    company: t.company ?? "",
    role: t.role ?? "",
    quote: t.quote,
    rating: t.rating,
    isActive: t.isActive,
    sortOrder: t.sortOrder,
  }));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-ink">
          Testimoni{" "}
          <span className="text-ink-soft font-medium">({safe.length})</span>
        </h2>
        <p className="text-sm text-ink-soft mt-1">
          Kelola testimoni klien. Hanya testimoni aktif yang tampil di situs.
        </p>
      </div>

      <TestimonialsTable testimonials={safe} />
    </div>
  );
}
