#!/usr/bin/env node
// Build a small client-side search index from docs/*.md so the site
// header SearchBox can filter docs without a third-party service.
//
// Each entry contains the title (first H1), the doc URL on the site,
// a short excerpt, and the plain-text body. Total payload should stay
// under a few KB; doc content is small and there are only a handful
// of pages.

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..", "..");
const docsDir = resolve(repoRoot, "docs");
const outputDir = resolve(repoRoot, "apps", "site", "public");
const outputPath = resolve(outputDir, "docs-search-index.json");

const SLUG_REWRITES = {
  README: "/docs",
};

function slugFromFilename(file) {
  const base = file.replace(/\.md$/i, "");
  if (SLUG_REWRITES[base]) {
    return SLUG_REWRITES[base];
  }
  return `/docs/${base}`;
}

function stripMarkdown(input) {
  return input
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_>]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(markdown, fallback) {
  const match = markdown.match(/^#\s+(.+)$/m);
  if (match && match[1]) {
    return match[1].trim();
  }
  return fallback;
}

async function buildIndex() {
  const files = (await readdir(docsDir)).filter((file) => file.endsWith(".md"));
  files.sort();

  const entries = [];
  for (const file of files) {
    const filePath = resolve(docsDir, file);
    const raw = await readFile(filePath, "utf8");
    const body = stripMarkdown(raw);
    const title = extractTitle(raw, file.replace(/\.md$/i, ""));
    const excerpt = body.slice(0, 220);
    entries.push({
      title,
      url: slugFromFilename(file),
      excerpt,
      body,
    });
  }

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, JSON.stringify(entries, null, 2));
  return entries.length;
}

const count = await buildIndex();
console.log(`docs-search-index: wrote ${count} entries to ${outputPath}`);
