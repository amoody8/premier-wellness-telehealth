import { defineConfig } from "tinacms";

/**
 * TinaCMS — Premier Wellness Telehealth
 *
 * Field labels and descriptions are written for a non-technical editor.
 * When adding a field, say what it does in plain language and where it
 * shows up on the site.
 *
 * NEVER add a field that could collect patient health information. This
 * website is deliberately outside HIPAA scope because it stores nothing.
 * Booking, intake, and messaging belong in SimplePractice, under their
 * business associate agreement.
 *
 * Collections mirror the existing content files exactly. Tina must not
 * reshape them — the Astro components and src/lib/derived.js read these
 * structures directly.
 */

const ICON_OPTIONS = [
  "phone", "mail", "clock", "map-pin", "menu", "arrow-right", "calendar",
  "alert-triangle", "check", "award", "layers", "star", "shield", "heart",
  "activity", "crosshair", "smile", "file-text", "stethoscope",
  "thermometer", "droplet", "lungs", "scale", "flask", "pill",
  "shield-check", "users", "video", "clipboard-list", "sun",
];

const ACCENT_HINT =
  'Put *asterisks* around one word to make it gold and italic — for example: Healthcare that takes time to *listen*.';

export default defineConfig({
  branch: process.env.TINA_BRANCH || "main",
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,

  // Astro serves the admin from public/ and the site from the root, so
  // no path prefix is involved — unlike the GitHub Pages setup this
  // replaced, where the subdirectory caused three separate bugs.
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },

  // Media library browses public/assets, so the existing brand files
  // (logo, favicon, icons) appear alongside anything newly uploaded.
  // Scoping it to uploads/ would have hidden them from the picker.
  media: {
    tina: {
      mediaRoot: "assets",
      publicFolder: "public",
    },
  },

  schema: {
    collections: [
    // ---------------------------------------------------------------
    // Homepage
    // ---------------------------------------------------------------
    {
      name: "home",
      label: "Homepage",
      path: "src/_data",
      format: "json",
      match: { include: "home" },
      ui: {
        allowedActions: { create: false, delete: false },
        router: () => "/",
      },
      fields: [
        {
          type: "object",
          name: "hero",
          label: "Top Section",
          fields: [
            { type: "string", name: "eyebrow", label: "Small Label",
              description: "The small gold text above the headline." },
            { type: "string", name: "headline", label: "Main Headline",
              description: ACCENT_HINT },
            { type: "string", name: "lede", label: "Introduction",
              ui: { component: "textarea" },
              description: "The paragraph under the headline." },
            {
              type: "object", name: "secondaryCta", label: "Second Button",
              fields: [
                { type: "string", name: "label", label: "Button Text" },
                { type: "string", name: "url", label: "Button Link" },
              ],
            },
            { type: "image", name: "image", label: "Photo",
              description: "A tall photo works best. Leave empty to show your logo instead." },
            { type: "string", name: "imageAlt", label: "Photo Description",
              description: "Describe the photo for people using screen readers." },
          ],
        },
        {
          type: "object",
          name: "trustItems",
          label: "Highlights",
          list: true,
          ui: { itemProps: (item) => ({ label: item?.heading ?? "Highlight" }) },
          description: "The three credentials shown below the top section.",
          fields: [
            { type: "string", name: "icon", label: "Icon", options: ICON_OPTIONS },
            { type: "string", name: "heading", label: "Title" },
            { type: "string", name: "body", label: "Description", ui: { component: "textarea" } },
          ],
        },
        {
          type: "object",
          name: "services",
          label: "Services Section",
          fields: [
            { type: "string", name: "eyebrow", label: "Small Label" },
            { type: "string", name: "headline", label: "Heading", description: ACCENT_HINT },
            { type: "string", name: "sub", label: "Introduction", ui: { component: "textarea" } },
            { type: "string", name: "ctaLabel", label: "Button Text" },
          ],
        },
        {
          type: "object",
          name: "founder",
          label: "Provider Section",
          fields: [
            { type: "string", name: "eyebrow", label: "Small Label" },
            { type: "string", name: "headline", label: "Heading", description: ACCENT_HINT },
            { type: "string", name: "body", label: "Biography",
              ui: { component: "textarea" },
              description: "Leave a blank line between paragraphs." },
            { type: "image", name: "image", label: "Your Photo",
              description: "Leave empty to show your logo until you have a headshot." },
            { type: "string", name: "imageAlt", label: "Photo Description" },
          ],
        },
        {
          type: "object",
          name: "testimonial",
          label: "Patient Quote",
          description:
            "Only publish a patient quote when you have that patient's written consent on file. Leave the quote blank to hide this section.",
          fields: [
            { type: "string", name: "body", label: "Quote", ui: { component: "textarea" } },
            { type: "string", name: "attribution", label: "Attributed To",
              description:
                'Do not use a patient\u2019s full name or any detail that could identify them. "A Patient" is the safe choice.' },
          ],
        },
        {
          type: "object",
          name: "visitTypes",
          label: "Visit Types Section",
          fields: [
            { type: "string", name: "eyebrow", label: "Small Label" },
            { type: "string", name: "headline", label: "Heading", description: ACCENT_HINT },
            { type: "string", name: "sub", label: "Introduction", ui: { component: "textarea" } },
            {
              type: "object", name: "options", label: "Visit Options", list: true,
              ui: { itemProps: (item) => ({ label: item?.title ?? "Option" }) },
              fields: [
                { type: "string", name: "icon", label: "Icon", options: ICON_OPTIONS },
                { type: "string", name: "title", label: "Title" },
                { type: "string", name: "body", label: "Description", ui: { component: "textarea" } },
                { type: "string", name: "bestFor", label: "Best For", list: true },
              ],
            },
          ],
        },
        {
          type: "object",
          name: "ctaStrip",
          label: "Bottom Banner",
          fields: [
            { type: "string", name: "text", label: "Banner Text", description: ACCENT_HINT },
          ],
        },
      ],
    },

    // ---------------------------------------------------------------
    // Practice details — the single source of truth for the whole site
    // ---------------------------------------------------------------
    {
      name: "site",
      label: "Practice Details",
      path: "src/_data",
      format: "json",
      match: { include: "site" },
      ui: {
        allowedActions: { create: false, delete: false },
        // No router: these are site-wide settings with no single page to
        // preview. Giving them the homepage's "/" made the editor open
        // the homepage form instead of this one.
      },
      fields: [
        {
          type: "string",
          name: "name",
          label: "Practice Name",
          description: "Shown in the header, footer, and browser tab.",
        },
        {
          type: "string",
          name: "legalName",
          label: "Legal Business Name",
          description: "Full legal name, used in copyright and legal documents.",
        },
        {
          type: "string",
          name: "tagline",
          label: "Tagline",
          description: "Your main tagline, shown in the browser tab on the homepage.",
        },
        {
          type: "string",
          name: "taglineShort",
          label: "Short Tagline",
          description: "The shorter version under the logo in the footer.",
        },
        {
          type: "string",
          name: "description",
          label: "Site Description",
          ui: { component: "textarea" },
          description:
            "One or two sentences describing the practice. Used by Google and shown when someone shares a link to your site.",
        },
        {
          type: "string",
          name: "email",
          label: "Contact Email",
          description:
            "Appears in the header, footer, and booking pop-up. Changing it here updates every place at once.",
        },
        {
          type: "string",
          name: "mailingAddress",
          label: "Mailing Address",
          ui: { component: "textarea" },
          description:
            "Required on your legal pages before publishing them. Leave blank until you have a business address to list.",
        },
        {
          type: "string",
          name: "ctaLabel",
          label: "Button Text",
          description: 'Text on every scheduling button, e.g. "Schedule Appointment".',
        },
        {
          type: "number",
          name: "minimumAge",
          label: "Minimum Patient Age",
          description: 'The youngest age you accept. Shown as "adults 18+".',
        },
        {
          type: "object",
          name: "booking",
          label: "Scheduling Links",
          description:
            "Links out to SimplePractice. While these are blank, scheduling buttons open a pop-up with your email and hours instead.",
          fields: [
            {
              type: "string",
              name: "url",
              label: "Booking Page URL",
              description:
                "Your SimplePractice booking link. Once filled in, every scheduling button sends patients straight there.",
            },
            {
              type: "string",
              name: "evisitUrl",
              label: "E-Visit URL",
              description: "Where patients start an online e-visit.",
            },
            {
              type: "string",
              name: "heading",
              label: "Pop-up Heading",
              description:
                'Title of the scheduling pop-up, e.g. "Schedule Your Visit". The pop-up is opened by a button, so it cannot be clicked on the page \u2014 edit it here.',
            },
            {
              type: "string",
              name: "note",
              label: "Pop-up Message",
              ui: { component: "textarea" },
              description: "Shown in the scheduling pop-up when no booking link is set.",
            },
          ],
        },
        {
          type: "object",
          name: "hours",
          label: "Office Hours",
          description:
            "Set your hours once here. The site writes them correctly in the footer, the booking pop-up, and the data Google reads.",
          fields: [
            {
              type: "string",
              name: "days",
              label: "Days Open",
              list: true,
              description:
                "One day per line, spelled out, in order — for example Tuesday, Wednesday, Thursday.",
            },
            {
              type: "string",
              name: "opens",
              label: "Opening Time",
              description: "24-hour format, e.g. 09:00 for 9 AM.",
            },
            {
              type: "string",
              name: "closes",
              label: "Closing Time",
              description: "24-hour format, e.g. 17:00 for 5 PM.",
            },
            {
              type: "string",
              name: "note",
              label: "Hours Note",
              description: 'e.g. "Other hours by appointment".',
            },
          ],
        },
        {
          type: "object",
          name: "states",
          label: "States Where You Are Licensed",
          list: true,
          ui: {
            itemProps: (item) => ({ label: `${item?.name ?? ""} (${item?.abbr ?? ""})` }),
          },
          description:
            "IMPORTANT — this is a legal statement about where you are licensed to practice. Only list states where your license is active. Updating this list changes every mention on the site.",
          fields: [
            { type: "string", name: "name", label: "State Name", description: "Spelled out, e.g. Florida." },
            { type: "string", name: "abbr", label: "Abbreviation", description: "Two letters, e.g. FL." },
          ],
        },
        {
          type: "object",
          name: "provider",
          label: "Provider Information",
          fields: [
            { type: "string", name: "name", label: "Full Name" },
            {
              type: "string",
              name: "shortName",
              label: "Short Name",
              description: 'Shorter form used in headings, e.g. "L. Moody".',
            },
            {
              type: "string",
              name: "credentials",
              label: "Credentials",
              description:
                'e.g. "DNP, APRN-C". Keep these visible so patients understand your role.',
            },
            { type: "string", name: "jobTitle", label: "Job Title", description: 'e.g. "Nurse Practitioner".' },
            {
              type: "string",
              name: "role",
              label: "Role Description",
              description: 'Shown under your name, e.g. "Founder & Nurse Practitioner".',
            },
            {
              type: "number",
              name: "yearsExperience",
              label: "Years of Experience",
              description: "A single number. Remember to update this each year.",
            },
          ],
        },
        {
          type: "string",
          name: "disclaimer",
          label: "Footer Disclaimer",
          ui: { component: "textarea" },
          description: "The legal disclaimer at the bottom of every page.",
        },

        // Technical settings — present so Tina preserves them on save.
        { type: "object", name: "wordmark", label: "Wordmark", fields: [
          { type: "string", name: "pre", label: "First word" },
          { type: "string", name: "em", label: "Accent word (gold italic)" },
          { type: "string", name: "post", label: "Last word" },
        ]},
        { type: "object", name: "brand", label: "Nav Brand Text", fields: [
          { type: "string", name: "line1", label: "Line 1" },
          { type: "string", name: "line2", label: "Line 2" },
        ]},
        { type: "string", name: "origin", label: "Site Origin (technical)" },
        { type: "string", name: "domain", label: "Domain (technical)" },
        // Brand images. These are image pickers rather than paths so the
        // logo can be replaced without touching code — the previous
        // "(technical)" string fields gave no way to upload one.
        {
          type: "image",
          name: "logo",
          label: "Logo",
          description:
            "Shown in the header, footer, and scheduling pop-up. An SVG stays sharp at every size; a PNG works too.",
        },
        {
          type: "image",
          name: "logoRaster",
          label: "Social Sharing Image",
          description:
            "Used when someone shares a link to your site. Must be a PNG or JPG — Facebook and LinkedIn do not display SVG files.",
        },
        {
          type: "image",
          name: "favicon",
          label: "Browser Tab Icon",
          description: "The small icon in the browser tab. A square PNG, around 64x64.",
        },
        {
          type: "image",
          name: "appleTouchIcon",
          label: "Phone Home-Screen Icon",
          description:
            "Shown when someone saves the site to their phone home screen. A square PNG, around 180x180.",
        },
      ],
    },

    // ---------------------------------------------------------------
    // Pricing
    // ---------------------------------------------------------------
    {
      name: "pricing",
      label: "Pricing",
      path: "src/_data",
      format: "json",
      match: { include: "pricing" },
      ui: {
        allowedActions: { create: false, delete: false },
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
          ui: { itemProps: (item) => ({ label: `${item?.name ?? ""} — $${item?.amount ?? ""}` }) },
          description: "Add, remove, or reorder visit types. The page adjusts automatically.",
          fields: [
            { type: "string", name: "name", label: "Visit Name" },
            {
              type: "number",
              name: "amount",
              label: "Price",
              description: "Numbers only — no dollar sign. The site adds it.",
            },
            { type: "string", name: "unit", label: "Price Unit", description: 'Shown under the price, e.g. "per visit".' },
            {
              type: "string",
              name: "description",
              label: "Description",
              ui: { component: "textarea" },
              description: "One or two sentences about what this visit covers.",
            },
          ],
        },
        {
          type: "object",
          name: "cancellation",
          label: "Cancellation Policy",
          description:
            "Used on the pricing page, in the FAQ, and on the legal pages — set once here.",
          fields: [
            {
              type: "number",
              name: "noticeHours",
              label: "Notice Required (hours)",
              description: "How much notice before a fee applies, e.g. 24.",
            },
            {
              type: "number",
              name: "fee",
              label: "Late Cancellation Fee",
              description: "Numbers only, e.g. 50.",
            },
          ],
        },
        {
          type: "string",
          name: "notes",
          label: "Payment Notes",
          list: true,
          ui: { component: "textarea" },
          description: "Bullet points shown under the prices.",
        },
      ],
    },

    // ---------------------------------------------------------------
    // Menus
    // ---------------------------------------------------------------
    {
      name: "nav",
      label: "Menus",
      path: "src/_data",
      format: "json",
      match: { include: "nav" },
      ui: {
        allowedActions: { create: false, delete: false },
        // No router — see Practice Details above.
      },
      fields: [
        {
          type: "object",
          name: "primary",
          label: "Top Menu",
          list: true,
          ui: { itemProps: (item) => ({ label: `${item?.label ?? ""} → ${item?.url ?? ""}` }) },
          description: "Only link to pages that exist, or visitors will hit an error page.",
          fields: [
            { type: "string", name: "label", label: "Link Text" },
            { type: "string", name: "url", label: "Address", description: "Start and end with a slash, e.g. /pricing/" },
          ],
        },
        {
          type: "object",
          name: "footer",
          label: "Footer Links",
          list: true,
          ui: { itemProps: (item) => ({ label: `${item?.label ?? ""} → ${item?.url ?? ""}` }) },
          fields: [
            { type: "string", name: "label", label: "Link Text" },
            { type: "string", name: "url", label: "Address" },
          ],
        },
      ],
    },

    // ---------------------------------------------------------------
    // Interior pages
    // ---------------------------------------------------------------
    {
      name: "about",
      label: "About Page",
      path: "src/_data",
      format: "json",
      match: { include: "about" },
      ui: { allowedActions: { create: false, delete: false }, router: () => "/about/" },
      fields: [
        { type: "string", name: "eyebrow", label: "Small Label" },
        { type: "string", name: "headline", label: "Page Heading", description: ACCENT_HINT },
        { type: "string", name: "lede", label: "Introduction", ui: { component: "textarea" } },
        { type: "string", name: "providerEyebrow", label: "Provider Section Label" },
        { type: "string", name: "bio", label: "Provider Biography", ui: { component: "textarea" },
          description: "Leave a blank line between paragraphs." },
        {
          type: "object", name: "credentials", label: "Credentials", list: true,
          ui: { itemProps: (i) => ({ label: i?.heading ?? "Credential" }) },
          fields: [
            { type: "string", name: "icon", label: "Icon", options: ICON_OPTIONS },
            { type: "string", name: "heading", label: "Title" },
            { type: "string", name: "body", label: "Description", ui: { component: "textarea" } },
          ],
        },
        { type: "string", name: "expectEyebrow", label: "Expectations Label" },
        { type: "string", name: "expectHeadline", label: "Expectations Heading", description: ACCENT_HINT },
        {
          type: "object", name: "expectations", label: "What To Expect", list: true,
          ui: { itemProps: (i) => ({ label: i?.title ?? "Item" }) },
          fields: [
            { type: "string", name: "icon", label: "Icon", options: ICON_OPTIONS },
            { type: "string", name: "title", label: "Title" },
            { type: "string", name: "body", label: "Description", ui: { component: "textarea" } },
          ],
        },
      ],
    },

    {
      name: "evisits",
      label: "E-Visits Page",
      path: "src/_data",
      format: "json",
      match: { include: "evisits" },
      ui: { allowedActions: { create: false, delete: false }, router: () => "/e-visits/" },
      fields: [
        { type: "string", name: "eyebrow", label: "Small Label" },
        { type: "string", name: "headline", label: "Page Heading", description: ACCENT_HINT },
        { type: "string", name: "lede", label: "Introduction", ui: { component: "textarea" } },
        { type: "string", name: "intro", label: "How It Works Summary", ui: { component: "textarea" },
          description:
            "Describes the e-visit process. The questionnaire itself lives in SimplePractice \u2014 never add one to this website." },
        {
          type: "object", name: "groups", label: "Information Cards", list: true,
          ui: { itemProps: (i) => ({ label: i?.title ?? "Card" }) },
          fields: [
            { type: "string", name: "icon", label: "Icon", options: ICON_OPTIONS },
            { type: "string", name: "title", label: "Card Title" },
            { type: "string", name: "items", label: "Points", list: true },
          ],
        },
        { type: "string", name: "clinicalNote", label: "Important Clinical Note",
          ui: { component: "textarea" } },
        { type: "string", name: "ctaLabel", label: "Button Text (when e-visit link is set)" },
        { type: "string", name: "ctaFallbackLabel", label: "Button Text (no link yet)" },
        { type: "string", name: "emergencyNotice", label: "Emergency Notice",
          ui: { component: "textarea" } },
      ],
    },

    {
      name: "legalhub",
      label: "Legal Hub Page",
      path: "src/_data",
      format: "json",
      match: { include: "legalhub" },
      ui: { allowedActions: { create: false, delete: false }, router: () => "/legal/" },
      fields: [
        { type: "string", name: "eyebrow", label: "Small Label" },
        { type: "string", name: "headline", label: "Page Heading", description: ACCENT_HINT },
        { type: "string", name: "lede", label: "Introduction", ui: { component: "textarea" } },
        { type: "string", name: "intro", label: "Opening Note", ui: { component: "textarea" } },
        {
          type: "string", name: "body", label: "Page Sections",
          ui: { component: "textarea" },
          description:
            'Start a section with "## " followed by its title \u2014 numbering is added for you. Do not type section numbers by hand.',
        },
      ],
    },

    {
      name: "policies",
      label: "Policy Documents",
      path: "src/_data",
      format: "json",
      match: { include: "policies" },
      ui: { allowedActions: { create: false, delete: false }, router: () => "/legal/" },
      fields: [
        {
          type: "object", name: "policies", label: "Policies", list: true,
          ui: { itemProps: (i) => ({ label: i?.title ?? "Policy" }) },
          fields: [
            { type: "string", name: "title", label: "Policy Name" },
            { type: "string", name: "url", label: "Link",
              description:
                'Leave blank until the document is written. Blank shows as "In preparation" instead of a broken link.' },
            { type: "string", name: "status", label: "Status", options: ["available", "pending"] },
            { type: "string", name: "summary", label: "Short Description", ui: { component: "textarea" } },
          ],
        },
      ],
    },

    // ---------------------------------------------------------------
    // Services — one page and one homepage tile per entry
    // ---------------------------------------------------------------
    {
      name: "services",
      label: "Services",
      path: "src/content/services",
      format: "md",
      match: { exclude: "services" }, // skip the Eleventy directory-data file
      ui: {
        router: ({ document }) => `/services/${document._sys.filename}/`,
      },
      fields: [
        { type: "string", name: "title", label: "Category Name", isTitle: true, required: true,
          description: "Shown on the tile and as the page heading." },
        { type: "number", name: "order", label: "Display Order", description: "Lower numbers appear first." },
        { type: "string", name: "icon", label: "Icon", options: ICON_OPTIONS },
        { type: "string", name: "summary", label: "Short Summary", ui: { component: "textarea" },
          description: "One sentence, shown on the services list page." },
        { type: "string", name: "intro", label: "Introduction", ui: { component: "textarea" },
          description: "The opening paragraph on this category's page." },
        {
          type: "object",
          name: "groups",
          label: "Condition Groups",
          list: true,
          ui: { itemProps: (item) => ({ label: item?.title ?? "Group" }) },
          description: "Each group becomes a card listing the conditions you treat.",
          fields: [
            { type: "string", name: "title", label: "Group Name" },
            { type: "string", name: "icon", label: "Icon", options: ICON_OPTIONS },
            { type: "string", name: "body", label: "Description", ui: { component: "textarea" } },
            { type: "string", name: "items", label: "Conditions", list: true,
              description: "One condition per line." },
          ],
        },
        { type: "string", name: "clinicalNote", label: "Clinical Limitations", ui: { component: "textarea" },
          description:
            "Important limits or safety information for this category. Shown in a separate box, apart from the marketing copy." },
      ],
    },

    // ---------------------------------------------------------------
    // FAQ
    // ---------------------------------------------------------------
    {
      name: "faq",
      label: "FAQ",
      path: "src/content/faq",
      format: "md",
      match: { exclude: "faq" },
      ui: {
        // Every question renders on the one FAQ page.
        router: () => "/faq/",
      },
      fields: [
        { type: "string", name: "question", label: "Question", isTitle: true, required: true },
        { type: "number", name: "order", label: "Display Order", description: "Lower numbers appear first." },
        {
          type: "rich-text",
          name: "body",
          label: "Answer",
          isBody: true,
          description:
            "Use bold for emphasis and bullet lists where it helps. Keep answers clear and short.",
        },
      ],
    },

    // ---------------------------------------------------------------
    // Legal documents
    //
    // Section numbers and the table of contents are generated at build
    // time from the "##" headings — never type numbers by hand.
    // ---------------------------------------------------------------
    {
      name: "legal",
      label: "Legal Documents",
      path: "src/content/legal",
      format: "md",
      match: { exclude: "legal" },
      ui: {
        allowedActions: { create: false, delete: false },
        router: ({ document }) => `/legal/${document._sys.filename}/`,
      },
      fields: [
        { type: "string", name: "title", label: "Document Title", isTitle: true, required: true },
        { type: "string", name: "eyebrow", label: "Small Label",
          description: 'The short label above the page heading, e.g. "HIPAA".' },
        { type: "string", name: "heading", label: "Page Heading", description: ACCENT_HINT },
        { type: "string", name: "description", label: "Search Description", ui: { component: "textarea" },
          description: "One sentence describing this document, used by search engines." },
        { type: "number", name: "order", label: "Display Order" },
        {
          type: "boolean",
          name: "draft",
          label: 'Show "Draft — attorney review required" notice',
          description:
            "Leave this ON until a healthcare attorney licensed in your states has reviewed this document. Turn it off only after that review.",
        },
        { type: "string", name: "effectiveDate", label: "Effective Date",
          description: "The date this version takes effect, e.g. 2026-11-01. Leave blank until published." },
        { type: "string", name: "lastUpdated", label: "Last Updated", description: "e.g. 2026-11-01." },
        {
          type: "boolean",
          name: "tocSkipFirst",
          label: "First section is an introduction",
          description:
            "Turn on when the first heading is an introduction rather than a numbered section. Section numbers and the contents list are generated automatically, so they always match.",
        },
        {
          type: "string",
          name: "body",
          label: "Document Text",
          isBody: true,
          ui: { component: "textarea" },
          description:
            'Start a section with "## " followed by its title — numbering is added for you. Do not type section numbers by hand. This is plain markdown, kept as-is so attorney-reviewed wording is never reformatted.',
        },
      ],
    },
  ],
  },
});
