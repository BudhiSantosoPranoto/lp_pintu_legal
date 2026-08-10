import { db } from "../src/lib/db";

async function main() {
  const services = await db.service.findMany({ select: { id: true, name: true }, take: 8 });
  console.log("Services:", services.length);

  const leads = await db.lead.findMany({ select: { id: true, name: true, serviceId: true, source: true } });
  console.log("Leads:", leads.length, JSON.stringify(leads.map(l => ({n: l.name, s: l.serviceId, src: l.source})), null, 2));

  if (services.length > 0 && leads.length > 0) {
    const pt = services.find(s => s.name.includes("PT"));
    const cv = services.find(s => s.name.includes("CV"));
    const hki = services.find(s => s.name.includes("Merek"));
    const nib = services.find(s => s.name.includes("NIB"));

    // Assign services to leads
    if (pt) await db.lead.updateMany({ where: { name: { contains: "Budi" } }, data: { serviceId: pt.id, source: "WEBSITE" } });
    if (hki) await db.lead.updateMany({ where: { name: { contains: "Agus" } }, data: { serviceId: hki.id, source: "WHATSAPP" } });
    if (nib) await db.lead.updateMany({ where: { name: { contains: "Rina" } }, data: { serviceId: nib.id, source: "WEBSITE" } });
    if (cv) await db.lead.updateMany({ where: { name: { contains: "Dewi" } }, data: { serviceId: cv.id, source: "NEWSLETTER" } });

    // Update newsletter leads
    await db.lead.updateMany({ where: { name: "Newsletter Subscriber" }, data: { source: "NEWSLETTER" } });

    console.log("Updated leads with serviceIds + sources");
  }

  await db.$disconnect();
}
main().catch(console.error);
