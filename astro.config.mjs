// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import netlify from "@astrojs/netlify";
import tina from "@tinacms/astro/integration";

/**
 * Premier Wellness Telehealth
 *
 * SSR is required, not a preference: TinaCMS refreshes each edited region
 * through an on-demand endpoint, which is what makes the editor update as
 * you type. That is why hosting is Netlify rather than GitHub Pages.
 *
 * Adapter differs by environment. @astrojs/netlify boots a Deno
 * edge-functions server in dev; when that fails it kills fetch to Tina's
 * local GraphQL API and surfaces as a confusing 500 on the page rather
 * than an adapter error. Node locally avoids it entirely.
 */
const isDev = process.env.NODE_ENV !== "production" && !process.env.NETLIFY;

export default defineConfig({
  // Netlify sets URL to the deploy's own address, so branch and preview
  // deploys emit canonical/OG URLs pointing at themselves rather than at
  // production. SITE_URL overrides it once a custom domain exists.
  site:
    process.env.SITE_URL ||
    process.env.URL ||
    "https://premierwellnesstelehealth.com",
  output: "server",
  adapter: isDev ? node({ mode: "standalone" }) : netlify(),
  integrations: [tina()],
  markdown: {
    shikiConfig: { theme: "css-variables" },
  },
});
