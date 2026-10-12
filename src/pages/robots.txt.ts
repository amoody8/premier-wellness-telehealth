import type { APIRoute } from "astro";
import { site } from "../lib/derived.js";

export const GET: APIRoute = ({ site: astroSite }) => {
  const origin = (astroSite?.origin ?? site.origin).replace(/\/+$/, "");
  return new Response(
    `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${origin}/sitemap.xml\n`,
    { headers: { "Content-Type": "text/plain" } },
  );
};
