import { defineConfig } from "tinacms";

/**
 * Spike config — pricing only.
 *
 * Purpose: prove that an editor can click an element on the real styled
 * page and edit it in the sidebar, with no React in the page tree.
 * If that works here, the full port is worth doing.
 */
export default defineConfig({
  branch: "main",
  clientId: null,
  token: null,

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },

  media: {
    tina: { mediaRoot: "uploads", publicFolder: "public" },
  },

  schema: {
    collections: [
      {
        name: "pricing",
        label: "Pricing",
        path: "src/_data",
        format: "json",
        match: { include: "pricing" },
        ui: {
          allowedActions: { create: false, delete: false },
          global: true,
          router: () => "/pricing/",
        },
        fields: [
          {
            type: "string",
            name: "intro",
            label: "Pricing Introduction",
            ui: { component: "textarea" },
            description: "The paragraph at the top of the pricing page.",
          },
          {
            type: "object",
            name: "visits",
            label: "Visit Types & Fees",
            list: true,
            ui: {
              itemProps: (item) => ({
                label: `${item?.name ?? ""} — $${item?.amount ?? ""}`,
              }),
            },
            fields: [
              { type: "string", name: "name", label: "Visit Name" },
              {
                type: "number",
                name: "amount",
                label: "Price",
                description: "Numbers only — no dollar sign. The site adds it.",
              },
              { type: "string", name: "unit", label: "Price Unit" },
              {
                type: "string",
                name: "description",
                label: "Description",
                ui: { component: "textarea" },
              },
            ],
          },
          {
            type: "object",
            name: "cancellation",
            label: "Cancellation Policy",
            fields: [
              { type: "number", name: "noticeHours", label: "Notice Required (hours)" },
              { type: "number", name: "fee", label: "Late Cancellation Fee" },
            ],
          },
          {
            type: "string",
            name: "notes",
            label: "Payment Notes",
            list: true,
            ui: { component: "textarea" },
          },
        ],
      },
    ],
  },
});
