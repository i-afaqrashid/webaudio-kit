#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(
  fileURLToPath(new URL("../package.json", import.meta.url)),
);
const expectedRepository =
  "git+https://github.com/i-afaqrashid/webaudio-kit.git";
const providedTag =
  process.argv[2] ?? process.env.RELEASE_TAG ?? process.env.GITHUB_REF_NAME;
const releaseTagPattern = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

if (!providedTag) {
  throw new Error("Release tag is required, for example v0.1.0");
}

const tag = providedTag.replace("refs/tags/", "");
const tagMatch = tag.match(releaseTagPattern);

if (!tagMatch) {
  throw new Error(`Release tag must be a stable semver tag, received ${tag}`);
}

const version = tag.slice(1);
const rootPackage = await readJson("package.json");
const packageManifests = [
  ["@webaudio-kit/core", await readJson("packages/core/package.json")],
  ["@webaudio-kit/react", await readJson("packages/react/package.json")],
];
const changelog = await readFile(join(root, "CHANGELOG.md"), "utf8");

const mismatches = [
  ["root package", rootPackage.version],
  ...packageManifests.map(([name, packageJson]) => [name, packageJson.version]),
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

for (const [name, packageJson] of packageManifests) {
  assertPublishablePackage(name, packageJson);
}

console.log(
  `Release tag ${tag} matches publishable package version ${version}`,
);

async function readJson(relativePath) {
  return JSON.parse(await readFile(join(root, relativePath), "utf8"));
}

function assertPublishablePackage(name, packageJson) {
  if (packageJson.private) {
    throw new Error(`${name} must not be private`);
  }

  if (packageJson.publishConfig?.access !== "public") {
    throw new Error(`${name} must declare publishConfig.access as public`);
  }

  if (packageJson.repository?.url !== expectedRepository) {
    throw new Error(
      `${name} repository.url must be ${expectedRepository}, received ${
        packageJson.repository?.url ?? "undefined"
      }`,
    );
  }
}
