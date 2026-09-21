import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { leads } from "@/db/schema";
import { getChatGPTUser } from "@/app/chatgpt-auth";

async function guard() { return Boolean(await getChatGPTUser()); }

export async function GET() {
  if (!(await guard())) return Response.json({ error: "Требуется вход" }, { status: 401 });
  const rows = await getDb().select().from(leads).orderBy(desc(leads.createdAt)).limit(250);
  return Response.json({ leads: rows });
}

export async function PATCH(request: Request) {
  if (!(await guard())) return Response.json({ error: "Требуется вход" }, { status: 401 });
  const payload = await request.json() as { id?: number; status?: string };
  const allowed = ["new", "contacted", "completed", "archived"];
  if (!payload.id || !payload.status || !allowed.includes(payload.status)) return Response.json({ error: "Некорректные данные" }, { status: 400 });
  await getDb().update(leads).set({ status: payload.status }).where(eq(leads.id, payload.id));
  return Response.json({ updated: true });
}
