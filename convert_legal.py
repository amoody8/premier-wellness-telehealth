#!/usr/bin/env python3
"""One-off: convert the v2 legal prose from HTML into markdown bodies.

The wording must survive byte-for-byte — these documents go to an attorney.
Only structure changes: h2/h3 become ## / ###, lists become markdown lists,
and the two custom block types become shortcodes. Hand-written "Section NN"
labels are dropped, since numbering is now generated at build time.

Run from the repo root:  python3 convert_legal.py
"""
import html
import pathlib
import re

ROOT = pathlib.Path(__file__).parent
OUT = ROOT / "src" / "content" / "legal"

PAGES = {
    "hipaa": {
        "title": "HIPAA Notice of Privacy Practices",
        "eyebrow": "HIPAA",
        "heading": "Notice of *Privacy Practices*",
        "description": "How Premier Wellness Telehealth uses and protects your health information under HIPAA.",
        "order": 1,
        "toc_skip_first": True,
    },
    "privacy": {
        "title": "Privacy Policy",
        "eyebrow": "Privacy",
        "heading": "Privacy *Policy*",
        "description": "How Premier Wellness Telehealth collects, uses, and protects information through our website.",
        "order": 2,
        "toc_skip_first": False,
    },
    "terms": {
        "title": "Terms of Service",
        "eyebrow": "Terms",
        "heading": "Terms of *Service*",
        "description": "Terms governing your use of the Premier Wellness Telehealth website and services.",
        "order": 3,
        "toc_skip_first": False,
    },
}

# Old paths -> new permalinks
LINK_MAP = {
    "./hipaa.html": "/legal/hipaa/",
    "./privacy.html": "/legal/privacy/",
    "./terms.html": "/legal/terms/",
    "./hipaa-v2.html": "/legal/hipaa/",
    "./privacy-v2.html": "/legal/privacy/",
    "./terms-v2.html": "/legal/terms/",
    "./index.html": "/",
    "./index-v2.html": "/",
}


def inline(text: str) -> str:
    """Convert inline HTML to markdown, preserving wording exactly."""
    text = re.sub(r"<strong>(.*?)</strong>", r"**\1**", text, flags=re.S)
    text = re.sub(r"<b>(.*?)</b>", r"**\1**", text, flags=re.S)
    text = re.sub(r"<em>(.*?)</em>", r"*\1*", text, flags=re.S)
    text = re.sub(r"<br\s*/?>", "  \n", text)

    def link(m):
        href = m.group(1)
        label = re.sub(r"<[^>]+>", "", m.group(2))
        return f"[{label}]({LINK_MAP.get(href, href)})"

    text = re.sub(r"<a[^>]*href=['\"]([^'\"]+)['\"][^>]*>(.*?)</a>", link, text, flags=re.S)
    text = re.sub(r"<[^>]+>", "", text)
    text = html.unescape(text)
    return re.sub(r"[ \t]+", " ", text).strip()


def list_items(block: str) -> list[str]:
    return [inline(li) for li in re.findall(r"<li>(.*?)</li>", block, re.S)]


def block(text: str) -> str:
    """Convert a callout body, keeping a leading <strong> on its own line.

    These blocks open with a bolded lead sentence followed directly by body
    copy. Rendered inline they would run together, so the lead becomes its
    own paragraph — which is also how the stylesheet expects it.
    """
    lead = re.match(r"\s*<strong>(.*?)</strong>\s*(.*)", text, re.S)
    if lead:
        rest = inline(lead.group(2))
        head = f"**{inline(lead.group(1))}**"
        return f"{head}\n\n{rest}" if rest else head
    return inline(text)


def convert(body: str) -> str:
    """Walk the prose top to bottom, emitting markdown."""
    out: list[str] = []
    token = re.compile(
        r"<h2 id=\"([^\"]+)\"[^>]*>(.*?)</h2>"
        r"|<h3>(.*?)</h3>"
        r"|<p>(.*?)</p>"
        r"|<ul>(.*?)</ul>"
        r"|<ol>(.*?)</ol>"
        r"|<div class=['\"]callout['\"]>(.*?)</div>"
        r"|<div class=['\"]emergency['\"]>(.*?)</div>",
        re.S,
    )

    for m in token.finditer(body):
        h2_id, h2_txt, h3, para, ul, ol, callout, emergency = m.groups()

        if h2_id is not None:
            # Drop the hand-written "Section NN" label; it is generated now.
            text = re.sub(r"<span class=\"num\">.*?</span>", "", h2_txt, flags=re.S)
            out.append(f"\n## {inline(text)}\n")
        elif h3 is not None:
            out.append(f"\n### {inline(h3)}\n")
        elif para is not None:
            out.append(inline(para) + "\n")
        elif ul is not None:
            out.extend(f"- {item}" for item in list_items(ul))
            out.append("")
        elif ol is not None:
            out.extend(f"{i}. {item}" for i, item in enumerate(list_items(ol), 1))
            out.append("")
        elif callout is not None:
            out.append("{% callout %}\n" + block(callout) + "\n{% endcallout %}\n")
        elif emergency is not None:
            out.append("{% emergency %}\n" + block(emergency) + "\n{% endemergency %}\n")

    md = "\n".join(out)
    return re.sub(r"\n{3,}", "\n\n", md).strip() + "\n"


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    for slug, meta in PAGES.items():
        src = (ROOT / f"{slug}-v2.html").read_text()
        article = re.search(r'<article class="prose">\s*(.*?)\s*</article>', src, re.S)
        body = article.group(1)
        body = re.sub(r'<div class="draft-warning">.*?</div>\s*</div>\s*', "", body, flags=re.S)

        front = [
            "---",
            f'title: "{meta["title"]}"',
            f'eyebrow: "{meta["eyebrow"]}"',
            f'heading: "{meta["heading"]}"',
            f'description: "{meta["description"]}"',
            f'order: {meta["order"]}',
            "draft: true",
            'effectiveDate: ""',
            'lastUpdated: ""',
        ]
        if meta["toc_skip_first"]:
            front.append("tocSkipFirst: true")
        front.append("---")

        path = OUT / f"{slug}.md"
        path.write_text("\n".join(front) + "\n\n" + convert(body))
        headings = len(re.findall(r"^## ", path.read_text(), re.M))
        print(f"{path.name}: {headings} sections, {len(path.read_text()):,} chars")


if __name__ == "__main__":
    main()
