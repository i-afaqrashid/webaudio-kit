#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(
  fileURLToPath(new URL("../package.json", import.meta.url)),
);
const providedTag =
  process.argv[2] ?? process.env.RELEASE_TAG ?? process.env.GITHUB_REF_NAME;

if (!providedTag) {
  throw new Error("Release tag is required, for example v0.1.0");
}

const tag = providedTag.replace("refs/tags/", "");
if (!/^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(tag)) {
  throw new Error(`Release tag must look like v0.1.0, received ${providedTag}`);
}

const version = tag.slice(1);
const rootPackage = await readJson("package.json");
const corePackage = await readJson("packages/core/package.json");
const reactPackage = await readJson("packages/react/package.json");
const changelog = await readFile(join(root, "CHANGELOG.md"), "utf8");

const mismatches = [
  ["root package", rootPackage.version],
  ["@webaudio-kit/core", corePackage.version],
  ["@webaudio-kit/react", reactPackage.version],
].filter(([, packageVersion]) => packageVersion !== version);

if (mismatches.length > 0) {
  throw new Error(
    [
      `Release tag ${tag} does not match package versions:`,
      ...mismatches.map(([name, packageVersion]) => {
        return `- ${name}: ${packageVersion}`;
      }),
    ].join("\n"),
  );
}

if (!changelog.includes(`## ${version} -`)) {
  throw new Error(`CHANGELOG.md must include a section for ${version}`);
}

console.log(`Release tag ${tag} matches package version ${version}`);

async function readJson(relativePath) {
  return JSON.parse(await readFile(join(root, relativePath), "utf8"));
}
