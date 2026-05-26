import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("public docs document controlled and persisted volume ergonomics", () => {
  const rootReadme = readFileSync("README.md", "utf8");
  const reactReadme = readFileSync("packages/react/README.md", "utf8");
  const apiDocs = readFileSync("docs/api.md", "utf8");
  const recipes = readFileSync("docs/recipes.md", "utf8");
  const siteApi = readFileSync("apps/site/app/docs/api/page.tsx", "utf8");
  const siteRecipes = readFileSync(
    "apps/site/app/docs/recipes/page.tsx",
    "utf8",
  );

  for (const contents of [rootReadme, reactReadme, apiDocs, siteApi]) {
    assert.match(contents, /useVolumeControl/);
    assert.match(contents, /inputProps/);
    assert.match(contents, /resetGain/);
  }

  for (const contents of [apiDocs, recipes, siteApi, siteRecipes]) {
    assert.match(contents, /Controlled Volume Slider/);
    assert.match(contents, /storageKey/);
    assert.match(contents, /provider gain/i);
    assert.match(contents, /safe bounds/i);
    assert.match(contents, /localStorage|persist/i);
  }

  assert.match(siteApi, /id: "use-volume-control"/);
  assert.match(siteApi, /href="#use-volume-control"/);
});
