# Astro + TinaCMS spike — verified working

Proof that click-to-edit works on this site's real markup and CSS, with no
React in the page tree. **Confirmed in the browser on 2026-10-11**: clicking a
price on the rendered page focuses that field in the Tina sidebar.

This is the thing that failed on Eleventy, where the previewed page had no way
to register its fields, so the sidebar stayed empty.

## Versions that worked

| Package | Version |
|---|---|
| astro | 7.3.8 |
| @tinacms/astro | 0.7.1 |
| tinacms | 3.14.3 |
| @astrojs/node | 11.1.7 |
| @astrojs/netlify | 8.2.9 |
| Node | 22.21.1 |

## Two gotchas, both cost real time

**1. The Netlify adapter breaks local dev.** It boots a Deno edge-functions
server that fails to start, and the failure kills `fetch` to Tina's localhost
GraphQL API — surfacing as a confusing 500 on the page rather than an adapter
error. Use `@astrojs/node` locally and `@astrojs/netlify` for deploys.

**2. Tina and Astro must run as separate processes.** The documented
`tinacms dev -c "astro dev"` form exited early here, leaving Astro up with no
GraphQL API behind it. Run them independently:

    npx @tinacms/cli dev          # :4001 graphql, :9000 datalayer
    npx astro dev --port 4321     # the site

## What the markup looks like

`tinaField()` stamps each element with the field it maps to:

```astro
<h3 data-tina-field={tinaField(pricing, `visits.${i}.name`)}>{visit.name}</h3>
```

Rendered output:

```html
<h3 data-tina-field="e1lf2e---pricing.visits.0.name">New Patient Visit</h3>
```

The integration serves `/admin/bridge.js` and injects form payloads only on
edit-mode requests, so production HTML stays clean.
