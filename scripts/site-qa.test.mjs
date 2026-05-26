import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("site QA is wired into scripts and CI", async () => {
  assert.equal(existsSync("scripts/site-qa.mjs"), true);

  const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
  assert.equal(packageJson.scripts["site:qa"], "node scripts/site-qa.mjs");

  const workflow = readFileSync(".github/workflows/ci.yml", "utf8");
  assert.match(workflow, /Run site browser QA/);
  assert.match(workflow, /pnpm site:qa/);
  assert.match(workflow, /Cache Playwright browsers/);
  assert.match(workflow, /pnpm exec playwright install --with-deps chromium/);

  const { SITE_QA_ROUTES, SITE_QA_VIEWPORTS } = await import("./site-qa.mjs");

  assert.deepEqual(
    SITE_QA_ROUTES.map((route) => route.path),
    [
      "/",
      "/docs",
      "/docs/api",
      "/docs/examples",
      "/docs/frameworks",
      "/docs/recipes",
      "/demos",
      "/demos/tone",
      "/demos/visualizer",
      "/demos/pitch",
      "/changelog",
    ],
  );
  assert.deepEqual(
    SITE_QA_VIEWPORTS.map((viewport) => viewport.name),
    ["desktop", "mobile"],
  );

  const script = readFileSync("scripts/site-qa.mjs", "utf8");
  assert.match(script, /detached:/);
  assert.match(script, /process\.kill\(-pid, signal\)/);
});
