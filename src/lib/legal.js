import { md, expandShortcodes } from "./markdown.js";

/**
 * Legal document numbering and contents list.
 *
 * Section numbers and the table of contents are both derived from the
 * rendered <h2>s, so they cannot drift apart. The hand-authored markup
 * had exactly that bug: the HIPAA notice carried ten headings but only
 * nine "Section NN" labels, leaving every heading one behind its
 * contents row.
 *
 * A page may set `tocSkipFirst` to mark a preamble heading as listed but
 * unnumbered — making the HIPAA case intentional rather than accidental.
 */

const H2_PATTERN = /<h2([^>]*)>([\s\S]*?)<\/h2>/g;

function parseHeadings(html, skipFirst) {
  const headings = [];
  let index = 0;
  let counter = 0;

  String(html).replace(H2_PATTERN, (match, attrs, inner) => {
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
function numberSections(html, headings) {
  let i = 0;
  return String(html).replace(H2_PATTERN, (match, attrs, inner) => {
    const heading = headings[i++];
    if (!heading || !heading.number) return match;
    return `<h2${attrs}><span class="num">Section ${heading.number}</span>${inner}</h2>`;
  });
}

/** Build the contents list from the same headings. */
function buildToc(headings) {
  const listed = headings.filter((h) => h.id);
  if (listed.length === 0) return "";

  const items = listed
    .map((h) => {
      const num = h.number
        ? `<span class="toc-num">${h.number}</span>`
        : `<span class="toc-num" aria-hidden="true">·</span>`;
      return `<li>${num}<a href="#${h.id}">${h.text}</a></li>`;
    })
    .join("");

  return `<ol>${items}</ol>`;
}

/**
 * Render a legal document body.
 *
 * Returns the numbered HTML and a matching contents list, both derived
 * from one pass over the headings.
 */
export function renderLegalBody(source, { tocSkipFirst = false } = {}) {
  const html = md.render(expandShortcodes(source));
  const headings = parseHeadings(html, tocSkipFirst);

  return {
    body: numberSections(html, headings),
    toc: buildToc(headings),
    headings,
  };
}
