import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const guidePath = "docs/hooks-vs-core.md";
const siteGuidePath = "apps/site/app/docs/hooks-vs-core/page.tsx";

test("hooks vs core guide exists and documents the intended interop pattern", () => {
  assert.equal(existsSync(guidePath), true, "Markdown guide should exist");

  const guide = readFileSync(guidePath, "utf8");

  for (const marker of [
    "# Hooks vs Core",
    "## Hooks first for React apps",
    "## Core first for non-React and custom graphs",
    "## React + core interop",
    "ensureAudioContext()",
    "playTone(runtime.audioContext",
    "playNoise(runtime.audioContext",
    "runtime.masterGain",
    "audio.stopAll()",
    "direct audio.audioContext null checks",
  ]) {
    assert.match(guide, new RegExp(escapeRegExp(marker)), marker);
  }
});

test("hooks vs core guide is linked from npm-facing and repository docs", () => {
  const requiredPackageLink =
    "https://github.com/i-afaqrashid/webaudio-kit/blob/main/docs/hooks-vs-core.md";

  assert.match(
    readFileSync("README.md", "utf8"),
    /\.\/docs\/hooks-vs-core\.md/,
    "README.md should link the local guide",
  );
  assert.match(
    readFileSync("docs/README.md", "utf8"),
    /\.\/hooks-vs-core\.md/,
    "docs/README.md should link the local guide",
  );

  for (const path of [
    "packages/core/README.md",
    "packages/react/README.md",
    "packages/cli/README.md",
  ]) {
    const contents = readFileSync(path, "utf8");
    assert.match(
      contents,
      new RegExp(escapeRegExp(requiredPackageLink)),
      `${path} should link the GitHub guide`,
    );
  }

  for (const path of ["docs/api.md", "docs/examples.md"]) {
    const contents = readFileSync(path, "utf8");
    assert.match(contents, /Hooks vs Core/, path);
    assert.match(contents, /hooks-vs-core\.md/, path);
  }
});

test("public docs site exposes hooks vs core guide from API and examples pages", () => {
  assert.equal(
    existsSync(siteGuidePath),
    true,
    "site guide route should exist",
  );

  const siteGuide = readFileSync(siteGuidePath, "utf8");
  for (const marker of [
    "Hooks vs Core",
    "ensureAudioContext()",
    "playTone(runtime.audioContext",
    "runtime.masterGain",
    "/docs/api#use-audio-context",
    "/docs/examples",
  ]) {
    assert.match(siteGuide, new RegExp(escapeRegExp(marker)), marker);
  }

  for (const path of [
    "apps/site/app/docs/page.tsx",
    "apps/site/app/docs/api/page.tsx",
    "apps/site/app/docs/examples/page.tsx",
  ]) {
    const contents = readFileSync(path, "utf8");
    assert.match(contents, /\/docs\/hooks-vs-core/, path);
    assert.match(contents, /Hooks vs Core/, path);
  }
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
