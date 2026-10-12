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
 * Resolve the template tokens left in content from the Eleventy build.
 *
 * Content files carry `{{ derived.statesLongOr }}` and
 * `{{ "/legal/hipaa/" | url }}`. Eleventy resolved these at render time;
 * Astro does not, so without this a visitor would see the raw token on
 * the page — which a word-for-word diff against production caught on the
 * terms and privacy pages.
 *
 * Keeping the tokens is deliberate: the states in the terms must stay
 * derived from site.json rather than hand-typed, which is what let a
 * stray "Arizona" survive there previously.
 */
export function resolveTokens(source, tokens = {}) {
  if (!source) return "";

  return (
    String(source)
      // {{ "/legal/hipaa/" | url }} -> /legal/hipaa/
      .replace(/\{\{\s*"([^"]+)"\s*\|\s*url\s*\}\}/g, "$1")
      // {{ derived.statesLongOr }} -> Florida, Virginia, or Washington
      .replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key) =>
        key in tokens ? tokens[key] : match,
      )
  );
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
