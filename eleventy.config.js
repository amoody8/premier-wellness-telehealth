import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";

/**
 * Eleventy config — Premier Wellness Telehealth
 *
 * ESM throughout (Eleventy 3 is ESM-first). Do not mix in CommonJS
 * `module.exports` — that is the classic v3 stumble.
 */
export default function (eleventyConfig) {
  // ---------------------------------------------------------------
  // Passthrough: assets ship as-is
  // ---------------------------------------------------------------
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });

  // Watch CSS/JS so `--serve` reloads on edit
  eleventyConfig.addWatchTarget("src/assets/css/");
  eleventyConfig.addWatchTarget("src/assets/js/");

  // ---------------------------------------------------------------
  // Markdown: anchors on headings so the legal TOC can link to them
  // ---------------------------------------------------------------
  const md = markdownIt({ html: true, linkify: true, typographer: false }).use(
    markdownItAnchor,
    {
      level: [2, 3],
      slugify: (s) =>
        s
          .trim()
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-"),
      permalink: false,
    },
  );
  eleventyConfig.setLibrary("md", md);

  /**
   * Render markdown inline — no wrapping <p>.
   *
   * This powers the single-field headline pattern: the editor writes
   * `Healthcare that *fits* your life.` and the asterisks become the
   * gold italic accent word. Strictly more flexible than splitting a
   * headline across three form fields, and far easier to explain.
   */
  eleventyConfig.addFilter("inlineMarkdown", (value) =>
    value ? md.renderInline(String(value)) : "",
  );

  // Full markdown render, for use inside macros/partials
  eleventyConfig.addFilter("markdown", (value) =>
    value ? md.render(String(value)) : "",
  );

  // ---------------------------------------------------------------
  // Dates
  // ---------------------------------------------------------------
  eleventyConfig.addFilter("year", () => String(new Date().getFullYear()));

  eleventyConfig.addFilter("readableDate", (value) => {
    if (!value) return "";
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
  });

  // ---------------------------------------------------------------
  // Collections
  // ---------------------------------------------------------------
  eleventyConfig.addCollection("serviceCategories", (api) =>
    api
      .getFilteredByGlob("src/content/services/*.md")
      .sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99)),
  );

  eleventyConfig.addCollection("faqs", (api) =>
    api
      .getFilteredByGlob("src/content/faq/*.md")
      .sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99)),
  );

  eleventyConfig.addCollection("legalDocs", (api) =>
    api
      .getFilteredByGlob("src/content/legal/*.md")
      .sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99)),
  );

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
}
