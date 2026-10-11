import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

/**
 * Content collections, replacing Eleventy's addCollection.
 *
 * Reads the same markdown files the CMS writes, so there is one source
 * of truth. Directory-data files left over from Eleventy (services.json,
 * faq.json, legal.json) are skipped.
 */

const CONTENT = path.join(process.cwd(), "src", "content");

async function readCollection(dir) {
  const full = path.join(CONTENT, dir);
  const files = await fs.readdir(full);

  const entries = await Promise.all(
    files
      .filter((f) => f.endsWith(".md"))
      .map(async (file) => {
        const raw = await fs.readFile(path.join(full, file), "utf8");
        const { data, content } = matter(raw);
        return { slug: file.replace(/\.md$/, ""), data, body: content };
      }),
  );

  return entries.sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));
}

export const getServiceCategories = () => readCollection("services");
export const getFaqs = () => readCollection("faq");
export const getLegalDocs = () => readCollection("legal");
