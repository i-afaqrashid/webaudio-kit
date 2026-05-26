import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const packageReadmes = [
  {
    path: "packages/core/README.md",
    packageUrl: "https://www.npmjs.com/package/@webaudio-kit/core",
  },
  {
    path: "packages/react/README.md",
    packageUrl: "https://www.npmjs.com/package/@webaudio-kit/react",
  },
  {
    path: "packages/cli/README.md",
    packageUrl: "https://www.npmjs.com/package/@webaudio-kit/cli",
  },
];

const requiredLinks = [
  "https://webaudio-kit.afaqrashid.com/docs/api",
  "https://webaudio-kit.afaqrashid.com/docs/examples",
  "https://webaudio-kit.afaqrashid.com/docs/recipes",
  "https://webaudio-kit.afaqrashid.com/demos",
  "https://webaudio-kit.afaqrashid.com/changelog",
  "https://github.com/i-afaqrashid/webaudio-kit/releases",
];

test("package READMEs expose public npm-facing docs links", () => {
  for (const readme of packageReadmes) {
    const contents = readFileSync(readme.path, "utf8");

    assert.match(contents, new RegExp(escapeRegExp(readme.packageUrl)));

    for (const link of requiredLinks) {
      assert.match(contents, new RegExp(escapeRegExp(link)), readme.path);
    }
  }
});

test("React README keeps framework install snippets copy-paste ready", () => {
  const contents = readFileSync("packages/react/README.md", "utf8");

  assert.match(contents, /## Framework Install Snippets/);
  assert.match(contents, /### Vite React/);
  assert.match(contents, /pnpm create vite/);
  assert.match(contents, /### Next App Router/);
  assert.match(contents, /"use client";/);
  assert.match(contents, /### Plain React/);
  assert.match(contents, /createRoot/);
});

test("Core README shows browser gesture setup and helper usage", () => {
  const contents = readFileSync("packages/core/README.md", "utf8");

  assert.match(contents, /## Browser Gesture Setup/);
  assert.match(contents, /button\.addEventListener\("click", async \(\) =>/);
  assert.match(contents, /playFrequencySweep/);
  assert.match(contents, /frequencyToNoteName\(440\)/);
});

test("CLI README exposes package manager invocations", () => {
  const contents = readFileSync("packages/cli/README.md", "utf8");

  assert.match(contents, /## Package Manager Snippets/);
  assert.match(contents, /pnpm dlx @webaudio-kit\/cli@latest agent-brief/);
  assert.match(contents, /npx @webaudio-kit\/cli@latest agent-brief/);
  assert.match(contents, /bunx @webaudio-kit\/cli@latest agent-brief/);
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
