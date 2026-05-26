import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("public docs document useAudioEngine provider-scoped playback", () => {
  const rootReadme = readFileSync("README.md", "utf8");
  const reactReadme = readFileSync("packages/react/README.md", "utf8");
  const apiDocs = readFileSync("docs/api.md", "utf8");
  const siteApi = readFileSync("apps/site/app/docs/api/page.tsx", "utf8");
  const interopGuide = readFileSync("docs/hooks-vs-core.md", "utf8");

  for (const contents of [rootReadme, reactReadme, apiDocs, siteApi]) {
    assert.match(contents, /useAudioEngine/);
    assert.match(contents, /withAudioRuntime/);
  }

  for (const contents of [apiDocs, siteApi, interopGuide]) {
    assert.match(contents, /playTone\(options\)/);
    assert.match(contents, /playNoise\(options\)/);
    assert.match(contents, /playFrequencySweep\(options\)/);
    assert.match(contents, /runtime\.masterGain/);
  }

  assert.match(siteApi, /id: "use-audio-engine"/);
  assert.match(siteApi, /href="#use-audio-engine"/);
  assert.match(reactReadme, /provider-scoped playback/i);
});
