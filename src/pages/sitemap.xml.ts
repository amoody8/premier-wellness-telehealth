import type { APIRoute } from "astro";
import { getServiceCategories } from "../lib/collections.js";
import { site } from "../lib/derived.js";

export const GET: APIRoute = async ({ site: astroSite }) => {
  const origin = (astroSite?.origin ?? site.origin).replace(/\/+$/, "");
  const categories = await getServiceCategories();

  const paths = [
    "/", "/about/", "/services/", "/pricing/", "/e-visits/", "/faq/",
    "/legal/", "/legal/hipaa/", "/legal/privacy/", "/legal/terms/",
    ...categories.map((c) => `/services/${c.slug}/`),
  ];

  const now = new Date().toISOString();
  const urls = paths
    .map((p) => `  <url>\n    <loc>${origin}${p}</loc>\n    <lastmod>${now}</lastmod>\n  </url>`)
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { "Content-Type": "application/xml" } },
  );
};
