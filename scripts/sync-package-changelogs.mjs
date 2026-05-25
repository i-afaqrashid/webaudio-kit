#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(
  fileURLToPath(new URL("../package.json", import.meta.url)),
);
const packageChangelogPaths = [
  "packages/core/CHANGELOG.md",
  "packages/react/CHANGELOG.md",
  "packages/cli/CHANGELOG.md",
];
const writeMode = process.argv.includes("--write");
const checkMode = process.argv.includes("--check") || !writeMode;
const rootChangelog = await readFile(join(root, "CHANGELOG.md"), "utf8");
const mismatches = [];

if (writeMode) {
  await Promise.all(
    packageChangelogPaths.map((relativePath) => {
      return writeFile(join(root, relativePath), rootChangelog);
    }),
  );

  console.log(
    `Synced ${packageChangelogPaths.length} package changelogs from CHANGELOG.md`,
  );
}

if (checkMode) {
  for (const relativePath of packageChangelogPaths) {
    const packageChangelog = await readFile(join(root, relativePath), "utf8");

    if (packageChangelog !== rootChangelog) {
      mismatches.push(relativePath);
    }
  }

  if (mismatches.length > 0) {
    throw new Error(
      [
        "Package changelogs must match root CHANGELOG.md.",
        ...mismatches.map((relativePath) => `- ${relativePath}`),
        "Run `pnpm release:sync-changelogs` after updating CHANGELOG.md.",
      ].join("\n"),
    );
  }

  console.log(
    `Package changelogs match root CHANGELOG.md (${packageChangelogPaths.length} packages)`,
  );
}
