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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
