import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const api = readFileSync("docs/api.md", "utf8");
const recipes = readFileSync("docs/recipes.md", "utf8");
const examples = readFileSync("docs/examples.md", "utf8");
const quickStart = readFileSync("docs/quick-start.md", "utf8");
const reactReadme = readFileSync("packages/react/README.md", "utf8");
const siteApi = readFileSync("apps/site/app/docs/api/page.tsx", "utf8");
const siteRecipes = readFileSync("apps/site/app/docs/recipes/page.tsx", "utf8");
const siteDemoPages = readFileSync(
  "apps/site/app/demos/demo-pages.tsx",
  "utf8",
);
const exampleApp = readFileSync(
  "examples/audio-test-mode/src/main.tsx",
  "utf8",
);

test("Markdown docs explain audio test mode preview state", () => {
  for (const contents of [api, recipes, examples, quickStart, reactReadme]) {
    assert.match(contents, /previewStep/);
    assert.match(contents, /previewStepIndex/);
  }

  assert.match(api, /`?currentStep`? remains `null` before a run starts/);
  assert.match(api, /`?previewStep`? points at the first planned step/);
  assert.match(recipes, /testMode\.previewStep\?\.label/);
  assert.match(examples, /testMode\.previewStep\?\.label/);
});

test("Public site docs and examples render previewStep guidance", () => {
  for (const contents of [siteApi, siteRecipes, siteDemoPages]) {
    assert.match(contents, /previewStep/);
    assert.match(contents, /previewStepIndex/);
  }

  assert.match(siteApi, /currentStep remains null before run/);
  assert.match(siteApi, /previewStep points at the first planned step/);
  assert.match(siteRecipes, /testMode\.previewStep\?\.label/);
  assert.match(siteDemoPages, /testMode\.previewStep\?\.label/);
});

test("Audio test mode example app uses previewStep for initial UI", () => {
  assert.match(exampleApp, /testMode\.previewStep\?\.label/);
  assert.match(exampleApp, /testMode\.previewStepIndex/);
});
