import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("public docs document explicit audio unlock UX", () => {
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
    assert.match(contents, /useAudioUnlock/);
    assert.match(contents, /unlock\(\)/);
    assert.match(contents, /isUnlocked/);
  }

  for (const contents of [apiDocs, recipes, siteApi, siteRecipes]) {
    assert.match(contents, /Enable Audio/);
    assert.match(contents, /browser autoplay/i);
    assert.match(contents, /idle/);
    assert.match(contents, /suspended/);
    assert.match(contents, /running/);
    assert.match(contents, /failed unlock|unlock failed/i);
  }

  assert.match(siteApi, /id: "use-audio-unlock"/);
  assert.match(siteApi, /href="#use-audio-unlock"/);
});
