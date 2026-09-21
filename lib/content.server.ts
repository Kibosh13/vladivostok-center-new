import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { contentItems } from "@/db/schema";
import { ContentItem, ContentType, defaultsByType } from "@/lib/content";

export async function getContent(type: ContentType, includeUnpublished = false): Promise<ContentItem[]> {
  const defaults = defaultsByType(type);
  try {
    const db = getDb();
    const rows = await db.select().from(contentItems).where(eq(contentItems.type, type)).orderBy(asc(contentItems.sortOrder));
    const overrides = new Map(rows.map((row) => [row.id, row as ContentItem]));
    const merged = defaults.map((item) => overrides.get(item.id) ?? item);
    const extras = rows.filter((row) => !defaults.some((item) => item.id === row.id)) as ContentItem[];
    const all = [...merged, ...extras].sort((a, b) => a.sortOrder - b.sortOrder);
    return includeUnpublished ? all : all.filter((item) => item.published);
  } catch {
    return includeUnpublished ? defaults : defaults.filter((item) => item.published);
  }
}
