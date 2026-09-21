import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { contentItems } from "@/db/schema";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getContent } from "@/lib/content.server";
import type { ContentType } from "@/lib/content";

const types: ContentType[] = ["specialist", "program", "event", "review"];

async function guard() { return Boolean(await getChatGPTUser()); }

export async function GET(request: Request) {
  if (!(await guard())) return Response.json({ error: "Требуется вход" }, { status: 401 });
  const type = new URL(request.url).searchParams.get("type") as ContentType | null;
  if (!type || !types.includes(type)) return Response.json({ error: "Некорректный раздел" }, { status: 400 });
  return Response.json({ items: await getContent(type, true) });
}

export async function POST(request: Request) {
  if (!(await guard())) return Response.json({ error: "Требуется вход" }, { status: 401 });
  const payload = await request.json() as Record<string, unknown>;
  const type = payload.type as ContentType;
  const title = String(payload.title || "").trim();
  if (!types.includes(type) || !title) return Response.json({ error: "Укажите раздел и заголовок" }, { status: 400 });
  const id = `${type}-${crypto.randomUUID()}`;
  const db = getDb();
  const [item] = await db.insert(contentItems).values({
    id, type, slug: String(payload.slug || title.toLowerCase().replace(/\s+/g, "-")), title,
    subtitle: String(payload.subtitle || ""), body: String(payload.body || ""), image: String(payload.image || ""),
    meta: String(payload.meta || "{}"), sortOrder: Number(payload.sortOrder || 100), published: payload.published !== false,
  }).returning();
  return Response.json({ item }, { status: 201 });
}

export async function PUT(request: Request) {
  if (!(await guard())) return Response.json({ error: "Требуется вход" }, { status: 401 });
  const payload = await request.json() as Record<string, unknown>;
  const id = String(payload.id || "");
  const type = payload.type as ContentType;
  const title = String(payload.title || "").trim();
  if (!id || !types.includes(type) || !title) return Response.json({ error: "Не хватает данных" }, { status: 400 });
  const db = getDb();
  await db.insert(contentItems).values({
    id, type, slug: String(payload.slug || id), title, subtitle: String(payload.subtitle || ""), body: String(payload.body || ""),
    image: String(payload.image || ""), meta: String(payload.meta || "{}"), sortOrder: Number(payload.sortOrder || 0),
    published: payload.published !== false, updatedAt: new Date().toISOString(),
  }).onConflictDoUpdate({ target: contentItems.id, set: {
    slug: String(payload.slug || id), title, subtitle: String(payload.subtitle || ""), body: String(payload.body || ""),
    image: String(payload.image || ""), meta: String(payload.meta || "{}"), sortOrder: Number(payload.sortOrder || 0),
    published: payload.published !== false, updatedAt: new Date().toISOString(),
  }});
  const [item] = await db.select().from(contentItems).where(and(eq(contentItems.id, id), eq(contentItems.type, type))).limit(1);
  return Response.json({ item });
}

export async function DELETE(request: Request) {
  if (!(await guard())) return Response.json({ error: "Требуется вход" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Не указан объект" }, { status: 400 });
  await getDb().delete(contentItems).where(eq(contentItems.id, id));
  return Response.json({ deleted: true });
}
