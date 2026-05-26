import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("recipe documentation covers common audio patterns", () => {
  assert.equal(existsSync("docs/recipes.md"), true);

  const recipes = readFileSync("docs/recipes.md", "utf8");
  const docsIndex = readFileSync("docs/README.md", "utf8");
  const rootReadme = readFileSync("README.md", "utf8");

  for (const heading of [
    "Enable Audio Button",
    "Tone Button",
    "Frequency Sweep Control",
    "Monitoring Alert Cues",
    "Master Volume Slider",
    "Waveform And Spectrum Panel",
    "Audio Test Mode",
    "Safe Autoplay Pattern",
  ]) {
    assert.match(recipes, new RegExp(`## ${heading}`));
  }

  for (const importName of [
    "AudioProvider",
    "useAudioUnlock",
    "useTone",
    "useFrequencySweep",
    "useVolume",
    "WaveformCanvas",
    "SpectrumCanvas",
    "useAudioTestMode",
  ]) {
    assert.match(recipes, new RegExp(importName));
  }

  assert.match(recipes, /browser autoplay/i);
  assert.match(recipes, /live recipe demos/i);
  assert.match(recipes, /severityProfiles/);
  assert.match(recipes, /previousSeverityRef/);
  assert.match(recipes, /transition/i);
  assert.match(recipes, /stopAll/);
  assert.match(recipes, /not certified alarms/i);
  assert.match(recipes, /not medical/i);
  assert.match(docsIndex, /Recipes/);
  assert.match(rootReadme, /Recipes/);
});
