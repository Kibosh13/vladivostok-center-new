import { seoDefinitions } from "./content";

export const siteOrigin = "https://putksebevladivostok.ru";
export function canonicalUrl(slug = "") { return `${siteOrigin}/${slug ? `${slug.replace(/^\/+|\/+$/g, "")}/` : ""}`; }
export function defaultPageSeo(slug: string, title: string, description: string) {
  const page = seoDefinitions.find((item) => item.slug === slug);
  return { title: page?.title || `${title} — Путь к себе`, description: page?.description || description, alternates: { canonical: canonicalUrl(slug) } };
}
export const organizationSchema = {
  "@context": "https://schema.org", "@type": ["Organization", "LocalBusiness"],
  "@id": `${siteOrigin}/#organization`, name: "Путь к себе", url: `${siteOrigin}/`,
  description: "Психологический и тренинговый центр во Владивостоке", telephone: "+79146658653",
  address: { "@type": "PostalAddress", streetAddress: "ул. Бестужева, 21Б, этаж 2", addressLocality: "Владивосток", addressCountry: "RU" },
};
export function personSchema(name: string, slug: string, jobTitle: string, image: string) {
  return { "@context": "https://schema.org", "@type": "Person", name, url: canonicalUrl(slug), jobTitle,
    image: `${siteOrigin}${image}`, worksFor: { "@type": "Organization", "@id": `${siteOrigin}/#organization`, name: "Путь к себе" } };
}
