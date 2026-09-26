import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { contentItems } from "@/db/schema";
import { ContentItem, ContentType, defaultsByType } from "@/lib/content";

const contentRevision = new Date("2026-09-26T10:25:00.000Z").getTime();
const revisedDefaults = new Set([
  "specialist-elizaveta",
  "specialist-mark",
  "specialist-maria",
  "specialist-tatyana",
  "specialist-olga",
  "event-review",
  "event-model",
  "event-yacht",
]);

function isNewerAdminEdit(item: ContentItem) {
  if (!revisedDefaults.has(item.id)) return true;
  const updatedAt = item.updatedAt ? new Date(item.updatedAt).getTime() : 0;
  return Number.isFinite(updatedAt) && updatedAt > contentRevision;
}

export async function getContent(type: ContentType, includeUnpublished = false): Promise<ContentItem[]> {
  const defaults = defaultsByType(type);
  try {
    const db = getDb();
    const rows = await db.select().from(contentItems).where(eq(contentItems.type, type)).orderBy(asc(contentItems.sortOrder));
    const overrides = new Map(rows.map((row) => [row.id, row as ContentItem]));
    const merged = defaults.map((item) => {
      const override = overrides.get(item.id) as ContentItem | undefined;
      return override && isNewerAdminEdit(override) ? override : item;
    });
    const extras = rows.filter((row) => !defaults.some((item) => item.id === row.id)) as ContentItem[];
    const all = [...merged, ...extras].sort((a, b) => a.sortOrder - b.sortOrder);
    return includeUnpublished ? all : all.filter((item) => item.published);
  } catch {
    return includeUnpublished ? defaults : defaults.filter((item) => item.published);
  }
}
