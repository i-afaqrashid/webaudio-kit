import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const repoRoot = new URL("../", import.meta.url);
const llms = readFileSync(
  new URL("apps/site/public/llms.txt", repoRoot),
  "utf8",
);

test("llms.txt links the comparison page", () => {
  assert.match(llms, /\/docs\/comparison/);
});

test("llms.txt lists the public React hooks", () => {
  for (const hook of [
    "useTone",
    "useFrequencySweep",
    "useNoise",
    "useToneSequence",
    "useVolumeControl",
    "useAnalyser",
    "useAudioTestMode",
  ]) {
    assert.match(llms, new RegExp(hook));
  }
});

test("llms.txt ships a runnable minimal example", () => {
  assert.match(llms, /AudioProvider/);
  assert.match(llms, /useTone/);
  assert.match(llms, /tone\.play\(\)/);
});
