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
  // Legal documents: numbering and contents, from one source
  //
  // Section numbers and the table of contents are both derived from the
  // rendered <h2>s, so they cannot drift apart. The previous hand-authored
  // markup had exactly that bug: the HIPAA notice carried ten headings but
  // only nine "Section NN" labels, leaving every heading one behind its
  // contents row.
  //
  // A heading marked `data-unnumbered` (or the first heading when the page
  // sets `tocSkipFirst`) is listed but not numbered — for preambles that
  // are not really section one.
  // ---------------------------------------------------------------

  const H2_PATTERN = /<h2([^>]*)>([\s\S]*?)<\/h2>/g;

  function parseHeadings(content, skipFirst) {
    const headings = [];
    let index = 0;
    let counter = 0;

    String(content).replace(H2_PATTERN, (match, attrs, inner) => {
      const idMatch = attrs.match(/id="([^"]+)"/);
      const unnumbered =
        /data-unnumbered/.test(attrs) || (skipFirst && index === 0);
      if (!unnumbered) counter += 1;

      headings.push({
        id: idMatch ? idMatch[1] : "",
        text: inner.replace(/<[^>]+>/g, "").trim(),
        number: unnumbered ? null : String(counter).padStart(2, "0"),
      });
      index += 1;
      return match;
    });

    return headings;
  }

  /** Inject the computed "Section NN" label into each heading. */
  eleventyConfig.addFilter("legalSections", function (content) {
    const skipFirst = this.ctx?.tocSkipFirst ?? false;
    const headings = parseHeadings(content, skipFirst);
    let i = 0;

    return String(content).replace(H2_PATTERN, (match, attrs, inner) => {
      const heading = headings[i++];
      if (!heading || !heading.number) return match;
      return `<h2${attrs}><span class="num">Section ${heading.number}</span>${inner}</h2>`;
    });
  });

  /** Build the contents list from the same headings. */
  eleventyConfig.addFilter("legalToc", function (content) {
    const skipFirst = this.ctx?.tocSkipFirst ?? false;
    const headings = parseHeadings(content, skipFirst).filter((h) => h.id);
    if (headings.length === 0) return "";

    const items = headings
      .map((h) => {
        const num = h.number
          ? `<span class="toc-num">${h.number}</span>`
          : `<span class="toc-num" aria-hidden="true">·</span>`;
        return `<li>${num}<a href="#${h.id}">${h.text}</a></li>`;
      })
      .join("");

    return `<ol>${items}</ol>`;
  });

  // ---------------------------------------------------------------
  // Dates
  // ---------------------------------------------------------------
  eleventyConfig.addFilter("year", () => String(new Date().getFullYear()));

  eleventyConfig.addFilter("startsWith", (value, prefix) =>
    String(value ?? "").startsWith(prefix),
  );

  /**
   * Build an absolute URL for metadata (canonical, Open Graph, sitemap).
   *
   * Takes an already-prefixed path — pipe through `url` first — and joins it
   * to the origin without doubling slashes.
   */
  eleventyConfig.addFilter("absolute", (path, origin) => {
    const base = String(origin ?? "").replace(/\/+$/, "");
    const rest = String(path ?? "");
    return `${base}${rest.startsWith("/") ? "" : "/"}${rest}`;
  });

  eleventyConfig.addFilter("isoDate", (value) => {
    const d = value instanceof Date ? value : new Date(value);
    return Number.isNaN(d.getTime())
      ? new Date().toISOString()
      : d.toISOString();
  });

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
  // Shortcodes for prose blocks
  //
  // These exist so legal bodies stay plain markdown. The CMS edits those
  // fields in raw mode, so shortcode syntax survives round-tripping where
  // literal HTML would risk being reformatted.
  // ---------------------------------------------------------------

  eleventyConfig.addPairedShortcode("callout", (content) => {
    return `<div class="callout">${md.render(content.trim())}</div>`;
  });

  eleventyConfig.addPairedShortcode("emergency", (content) => {
    return `<div class="emergency" role="note">${md.render(content.trim())}</div>`;
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

    // GitHub Pages serves this project from a subdirectory, not the domain
    // root, so every internal link and asset path must carry this prefix.
    // Pass internal paths through the `url` filter — a bare "/assets/..."
    // resolves against the domain root and 404s.
    //
    // When a custom domain is added, set this back to "/".
    pathPrefix: process.env.PATH_PREFIX ?? "/premier-wellness-telehealth/",
  };
}
