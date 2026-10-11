import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";

/**
 * Markdown rendering, ported from the Eleventy config.
 *
 * Kept as plain functions so Astro components and the legal-document
 * pipeline share exactly one implementation.
 */

export const md = markdownIt({
  html: true,
  linkify: true,
  typographer: false,
}).use(markdownItAnchor, {
  level: [2, 3],
  slugify: (s) =>
    s
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-"),
  permalink: false,
});

/**
 * Render inline markdown with no wrapping <p>.
 *
 * This powers the single-field headline pattern: the editor writes
 * `Healthcare that *fits* your life.` and the asterisks become the gold
 * italic accent word. Used in nearly every heading on the site.
 */
export function inlineMarkdown(value) {
  return value ? md.renderInline(String(value)) : "";
}

/** Full markdown render. */
export function markdown(value) {
  return value ? md.render(String(value)) : "";
}

/**
 * Paired shortcodes used inside legal prose.
 *
 * Authors write `{% callout %}...{% endcallout %}` in markdown. Expanding
 * them here, before markdown-it runs, keeps the source plain text so
 * attorney-reviewed wording is never reformatted by a rich-text editor.
 */
export function expandShortcodes(source) {
  if (!source) return "";

  return String(source)
    .replace(
      /\{%\s*callout\s*%\}([\s\S]*?)\{%\s*endcallout\s*%\}/g,
      (_, body) => `<div class="callout">${md.render(body.trim())}</div>`,
    )
    .replace(
      /\{%\s*emergency\s*%\}([\s\S]*?)\{%\s*endemergency\s*%\}/g,
      (_, body) =>
        `<div class="emergency" role="note">${md.render(body.trim())}</div>`,
    );
}
