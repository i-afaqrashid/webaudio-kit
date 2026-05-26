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
  const routeMetadata = Object.fromEntries(
    SITE_QA_ROUTES.map((route) => [route.path, route.metadata]),
  );

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
  assert.deepEqual(routeMetadata["/"], {
    title: "webaudio-kit",
    description:
      "React hooks and browser-safe Web Audio primitives for tone tools, frequency sweeps, noise bursts, volume control, and analyser-driven UI.",
    ogTitle: "webaudio-kit",
  });
  assert.deepEqual(routeMetadata["/docs"], {
    title: "Docs | webaudio-kit",
    description:
      "Install webaudio-kit, wire AudioProvider, use tone, sweep, and noise hooks, and understand browser audio safety constraints.",
    ogTitle: "Docs | webaudio-kit",
  });
  assert.deepEqual(routeMetadata["/demos/tone"], {
    title: "Tone generator | webaudio-kit",
    description:
      "Change frequency, gain, pan, and waveform while the analyser confirms the provider graph is live.",
    ogTitle: "Tone generator | webaudio-kit",
  });
  assert.deepEqual(routeMetadata["/changelog"], {
    title: "Changelog | webaudio-kit",
    description:
      "Versioned release history for webaudio-kit packages, GitHub Releases, and npm package pages.",
    ogTitle: "Changelog | webaudio-kit",
  });

  const script = readFileSync("scripts/site-qa.mjs", "utf8");
  assert.match(script, /detached:/);
  assert.match(script, /process\.kill\(-pid, signal\)/);
  assert.match(script, /meta\[name="description"\]/);
  assert.match(script, /meta\[property="og:title"\]/);
  assert.match(script, /meta\[name="twitter:card"\]/);
});
