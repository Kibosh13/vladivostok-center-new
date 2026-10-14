import { getDb } from "@/db";
import { leads } from "@/db/schema";
import { getContent } from "@/lib/content.server";

export async function POST(request: Request) {
  try {
    const payload = await request.json() as { name?: string; phone?: string; email?: string; message?: string; source?: string; consent?: boolean; marketingConsent?: boolean; specialist?: string };
    if (payload.consent !== true) return Response.json({ error: "Требуется отдельное согласие на обработку персональных данных" }, { status: 400 });
    const docs = await getContent("document");
    if (payload.marketingConsent === true && !docs.some((doc) => doc.slug === "reklamnye-rassylki" && doc.body.trim())) return Response.json({ error: "Рекламное согласие пока недоступно" }, { status: 400 });
    const name = payload.name?.trim() || "";
    const phone = payload.phone?.trim() || "";
    if (name.length < 2 || phone.length < 6) return Response.json({ error: "Укажите имя и телефон" }, { status: 400 });
    const db = getDb();
    const [lead] = await db.insert(leads).values({
      name: name.slice(0, 120), phone: phone.slice(0, 80), email: (payload.email || "").trim().slice(0, 180),
      message: [`Специалист: ${(payload.specialist || "не выбран").slice(0, 150)}`, (payload.message || "").trim().slice(0, 500), `Согласие на обработку данных: да. Версии: ${docs.filter((doc) => ["privacy", "soglasie-na-obrabotku-dannyh"].includes(doc.slug)).map((doc) => `${doc.slug}: ${doc.updatedAt || "опубликованная редакция"}`).join("; ")}. Рекламное согласие: ${payload.marketingConsent === true ? "да" : "нет"}.`].join("\n"), source: (payload.source || "site").slice(0, 80), status: "new",
    }).returning();
    return Response.json({ lead: { id: lead.id, status: lead.status } }, { status: 201 });
  } catch {
    return Response.json({ error: "Заявку не удалось сохранить. Позвоните нам по номеру +7 914 665-86-53." }, { status: 503 });
  }
}
