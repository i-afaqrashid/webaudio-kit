import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const llmsPath = "apps/site/public/llms.txt";
const robotsPath = "apps/site/public/robots.txt";
const fetchAccessPath = "docs/fetch-access.md";

test("site exposes crawler and LLM docs indexes", () => {
  assert.equal(existsSync(llmsPath), true, "llms.txt should be deployed");
  assert.equal(existsSync(robotsPath), true, "robots.txt should be deployed");

  const llms = readFileSync(llmsPath, "utf8");
  assert.match(llms, /# webaudio-kit/);
  assert.match(llms, /https:\/\/webaudio-kit\.afaqrashid\.com\/docs\/api/);
  assert.match(
    llms,
    /https:\/\/github\.com\/i-afaqrashid\/webaudio-kit\/tree\/main\/docs/,
  );
  assert.match(llms, /docs\/api\.md/);
  assert.match(llms, /docs\/browser-audio\.md/);
  assert.match(llms, /docs\/troubleshooting\.md/);

  const robots = readFileSync(robotsPath, "utf8");
  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /Allow: \//);
  assert.match(
    robots,
    /LLM docs index: https:\/\/webaudio-kit\.afaqrashid\.com\/llms\.txt/,
  );
});

test("fetch-access note records deployed docs probe results", () => {
  assert.equal(
    existsSync(fetchAccessPath),
    true,
    "docs/fetch-access.md should document the crawler check",
  );

  const contents = readFileSync(fetchAccessPath, "utf8");
  for (const marker of [
    "curl/8.7.1",
    "Wget/1.21.4",
    "python-requests/2.32.3",
    "Googlebot/2.1",
    "ChatGPT-User/1.0",
    "ClaudeBot/1.0",
    "HTTP 200",
  ]) {
    assert.match(contents, new RegExp(escapeRegExp(marker)), marker);
  }
});

test("README and package pages expose Markdown docs fallback", () => {
  for (const path of [
    "README.md",
    "packages/core/README.md",
    "packages/react/README.md",
    "packages/cli/README.md",
  ]) {
    const contents = readFileSync(path, "utf8");
    assert.match(
      contents,
      /https:\/\/github\.com\/i-afaqrashid\/webaudio-kit\/tree\/main\/docs/,
      path,
    );
    assert.match(
      contents,
      /https:\/\/webaudio-kit\.afaqrashid\.com\/llms\.txt/,
      path,
    );
  }
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
