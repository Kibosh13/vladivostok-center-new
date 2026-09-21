import { getDb } from "@/db";
import { leads } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const payload = await request.json() as { name?: string; phone?: string; email?: string; message?: string; source?: string };
    const name = payload.name?.trim() || "";
    const phone = payload.phone?.trim() || "";
    if (name.length < 2 || phone.length < 6) return Response.json({ error: "Укажите имя и телефон" }, { status: 400 });
    const db = getDb();
    const [lead] = await db.insert(leads).values({
      name: name.slice(0, 120), phone: phone.slice(0, 80), email: (payload.email || "").trim().slice(0, 180),
      message: (payload.message || "").trim().slice(0, 2500), source: (payload.source || "site").slice(0, 80), status: "new",
    }).returning();
    return Response.json({ lead: { id: lead.id, status: lead.status } }, { status: 201 });
  } catch {
    return Response.json({ error: "Заявку не удалось сохранить. Позвоните нам по номеру +7 996 424-90-49." }, { status: 503 });
  }
}
