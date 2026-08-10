import { db } from "../src/lib/db";

async function main() {
  const services = await db.service.findMany({ select: { id: true, name: true } });
  const pt = services.find(s => s.name.includes("PT"));
  const nib = services.find(s => s.name.includes("NIB"));

  // Update Smoke Test lead
  if (pt) {
    await db.lead.updateMany({ where: { name: "Smoke Test" }, data: { serviceId: pt.id, source: "WEBSITE" } });
  }

  // Also add a few leads directly to DB (bypassing rate limit)
  if (pt && nib) {
    await db.lead.create({
      data: {
        name: "Agus Setiawan",
        phone: "08123450002",
        email: "agus@example.com",
        serviceId: services.find(s => s.name.includes("Merek"))?.id ?? pt.id,
        businessName: "CV Agus Jaya",
        message: "Pendaftaran merek untuk brand kami",
        status: "NEW",
        source: "WHATSAPP",
      }
    });
    await db.lead.create({
      data: {
        name: "Rina Marlina",
        phone: "08123450003",
        email: "rina@example.com",
        serviceId: nib.id,
        businessName: "",
        message: "NIB untuk usaha kuliner",
        status: "CONTACTED",
        source: "WEBSITE",
      }
    });
    await db.lead.create({
      data: {
        name: "Dewi Lestari",
        phone: "08123450001",
        email: "dewi@example.com",
        serviceId: services.find(s => s.name.includes("CV"))?.id ?? pt.id,
        businessName: "Toko Dewi",
        message: "Konsultasi pendirian CV",
        status: "QUALIFIED",
        source: "NEWSLETTER",
      }
    });
    console.log("Added 3 leads directly");
  }

  const allLeads = await db.lead.findMany({ select: { id: true, name: true, serviceId: true, source: true, status: true } });
  console.log("Total leads:", allLeads.length);
  console.log(JSON.stringify(allLeads, null, 2));

  await db.$disconnect();
}
main().catch(console.error);
