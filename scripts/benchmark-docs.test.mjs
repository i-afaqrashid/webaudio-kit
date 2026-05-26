import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("benchmark documentation is public, linked, and telemetry-free", () => {
  assert.equal(existsSync("docs/benchmarks.md"), true);
  assert.equal(existsSync("apps/site/app/docs/benchmarks/page.tsx"), true);

  const benchmarkDocs = readFileSync("docs/benchmarks.md", "utf8");
  assert.match(benchmarkDocs, /^# Benchmarks/m);
  assert.match(benchmarkDocs, /pnpm bench/);
  assert.match(benchmarkDocs, /benchmarks\/core-math\.bench\.ts/);
  assert.match(benchmarkDocs, /benchmarks\/core-playback\.bench\.ts/);
  assert.match(benchmarkDocs, /benchmarks\/analyser-frame\.bench\.ts/);
  assert.match(benchmarkDocs, /benchmarks\/react-hooks\.bench\.tsx/);
  assert.match(benchmarkDocs, /local trend signals/i);
  assert.match(benchmarkDocs, /not release gates/i);
  assert.match(benchmarkDocs, /browser/i);
  assert.match(benchmarkDocs, /device/i);
  assert.match(benchmarkDocs, /No telemetry/i);
  assert.match(benchmarkDocs, /No analytics/i);
  assert.match(benchmarkDocs, /No tracking/i);

  const publicLink = "https://webaudio-kit.afaqrashid.com/docs/benchmarks";
  const rootReadme = readFileSync("README.md", "utf8");
  assert.match(rootReadme, new RegExp(escapeRegExp(publicLink)));
  assert.match(rootReadme, /docs\/benchmarks\.md/);

  const docsReadme = readFileSync("docs/README.md", "utf8");
  assert.match(docsReadme, /\[Benchmarks\]\(\.\/benchmarks\.md\)/);

  const performanceDocs = readFileSync("docs/performance.md", "utf8");
  assert.match(performanceDocs, /\[Benchmark guide\]\(\.\/benchmarks\.md\)/);
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
