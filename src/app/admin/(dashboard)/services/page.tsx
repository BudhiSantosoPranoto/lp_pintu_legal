import { db } from "@/lib/db";
import { serviceIconNames } from "@/components/site/service-icon";
import { ServicesTable } from "@/components/admin/services-table";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const [services, categories] = await Promise.all([
    db.service.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    }),
    db.serviceCategory.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  const safeServices = services.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    shortDescription: s.shortDescription,
    description: s.description,
    icon: s.icon,
    durationLabel: s.durationLabel ?? "",
    priceLabel: s.priceLabel ?? "",
    categoryId: s.categoryId ?? "",
    categoryName: s.category?.name ?? null,
    isActive: s.isActive,
    isFeatured: s.isFeatured,
    sortOrder: s.sortOrder,
    // JSON-encoded fields are passed through untouched for the edit form
    // (we only allow editing core fields in Phase 1).
    highlights: s.highlights ?? "",
    processSteps: s.processSteps ?? "",
    requirements: s.requirements ?? "",
    faqsJson: s.faqsJson ?? "",
  }));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-ink">
          Layanan <span className="text-ink-soft font-medium">({safeServices.length})</span>
        </h2>
        <p className="text-sm text-ink-soft mt-1">
          Kelola daftar layanan, status aktif, urutan, dan tanda unggulan.
        </p>
      </div>

      <ServicesTable
        services={safeServices}
        categories={categories}
        iconNames={serviceIconNames()}
      />
    </div>
  );
}
