// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import tina from "@tinacms/astro/integration";

// Spike uses the Node adapter locally. The Netlify adapter tries to boot a
// Deno edge-functions server in dev, which fails and breaks fetch to
// Tina's localhost GraphQL API. Swap to @astrojs/netlify for deployment.
export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  integrations: [tina()],
});
