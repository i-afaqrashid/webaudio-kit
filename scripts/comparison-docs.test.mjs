import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const repoRoot = new URL("../", import.meta.url);

const readDoc = (relativePath) =>
  readFileSync(new URL(relativePath, repoRoot), "utf8");

const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const markdown = readDoc("docs/comparison.md");
const sitePage = readDoc("apps/site/app/docs/comparison/page.tsx");

test("comparison doc covers the libraries it compares", () => {
  for (const lib of ["webaudio-kit", "Tone.js", "Howler", "use-sound"]) {
    assert.match(markdown, new RegExp(escape(lib)));
  }
});

test("comparison site page mirrors the doc", () => {
  for (const lib of ["Tone.js", "Howler", "use-sound"]) {
    assert.match(sitePage, new RegExp(escape(lib)));
  }
});

test("comparison site page links back to its markdown source", () => {
  assert.match(
    sitePage,
    /github\.com\/i-afaqrashid\/webaudio-kit\/blob\/main\/docs\/comparison\.md/,
  );
});
