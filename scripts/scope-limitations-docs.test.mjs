import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const guidePath = "docs/scope-and-limitations.md";
const siteGuidePath = "apps/site/app/docs/scope/page.tsx";

test("scope and limitations guide exists and sets clear product boundaries", () => {
  assert.equal(existsSync(guidePath), true, "Markdown guide should exist");

  const guide = readFileSync(guidePath, "utf8");

  for (const marker of [
    "# Scope and Limitations",
    "safe procedural UI audio",
    "## What webaudio-kit is for",
    "## What webaudio-kit is not",
    "## When the hooks are enough",
    "## When core primitives are enough",
    "## When to use raw Web Audio",
    "## When to use Tone.js or a full audio engine",
    "## Current limitations",
    "full synthesizer graph",
    "AudioWorklets",
    "routing matrix",
    "young ecosystem",
  ]) {
    assert.match(guide, new RegExp(escapeRegExp(marker)), marker);
  }

  assert.match(guide, /envelopes,\s+patterns,\s+filters,\s+and richer recipes/);
});

test("scope guide is linked from repository and npm-facing docs", () => {
  assert.match(
    readFileSync("README.md", "utf8"),
    /\.\/docs\/scope-and-limitations\.md/,
    "README.md should link the local guide",
  );
  assert.match(
    readFileSync("docs/README.md", "utf8"),
    /\.\/scope-and-limitations\.md/,
    "docs/README.md should link the local guide",
  );

  const requiredPackageLink =
    "https://github.com/i-afaqrashid/webaudio-kit/blob/main/docs/scope-and-limitations.md";

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
});

test("public docs site exposes scope guide from docs home and hooks guide", () => {
  assert.equal(
    existsSync(siteGuidePath),
    true,
    "site guide route should exist",
  );

  const siteGuide = readFileSync(siteGuidePath, "utf8");
  for (const marker of [
    "Scope and limitations",
    "safe procedural UI audio",
    "Tone.js",
    "raw Web Audio",
    "AudioWorklets",
    "young ecosystem",
    "/docs/hooks-vs-core",
    "/docs/recipes",
  ]) {
    assert.match(siteGuide, new RegExp(escapeRegExp(marker)), marker);
  }

  for (const path of [
    "apps/site/app/docs/page.tsx",
    "apps/site/app/docs/hooks-vs-core/page.tsx",
  ]) {
    const contents = readFileSync(path, "utf8");
    assert.match(contents, /\/docs\/scope/, path);
    assert.match(contents, /Scope/, path);
  }
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
