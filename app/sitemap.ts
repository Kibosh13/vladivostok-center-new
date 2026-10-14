import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content.server";
import { specialistProfiles } from "@/lib/specialists";
import { canonicalUrl } from "@/lib/seo";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = ["", "osnovatel", "specialisty", "uslugi", "meropriyatiya", "arhiv-meropriyatiy", "otzyvy", "contacts", "obrazovanie", "test-na-resursnost", "dokumenty", ...specialistProfiles.map(p => `specialisty/${p.slug}`)];
  const docs = await getContent("document");
  return [...slugs.map(slug => ({ url: canonicalUrl(slug) })), ...docs.filter(d => d.body.trim()).map(d => ({ url: canonicalUrl(d.slug) }))];
}
