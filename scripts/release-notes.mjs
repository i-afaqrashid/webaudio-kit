#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const root = dirname(
  fileURLToPath(new URL("../package.json", import.meta.url)),
);

export const releaseTagPattern = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

export const releasePackageHistory = [
  { name: "@webaudio-kit/core", since: "1.0.0" },
  { name: "@webaudio-kit/react", since: "1.0.0" },
  { name: "@webaudio-kit/cli", since: "1.4.0" },
];

export function normalizeReleaseTag(input) {
  const tag = input?.replace("refs/tags/", "");

  if (!tag) {
    throw new Error("Release tag is required, for example v1.5.1");
  }

  if (!releaseTagPattern.test(tag)) {
    throw new Error(`Release tag must be a stable semver tag, received ${tag}`);
  }

  return tag;
}

export function extractChangelogSection(changelog, version) {
  const lines = changelog.split(/\r?\n/);
  const headingIndex = lines.findIndex((line) =>
    line.startsWith(`## ${version} - `),
  );

  if (headingIndex === -1) {
    throw new Error(`CHANGELOG.md must include a section for ${version}`);
  }

  const nextHeadingIndex = lines.findIndex((line, index) => {
    return index > headingIndex && line.startsWith("## ");
  });
  const bodyEndIndex =
    nextHeadingIndex === -1 ? lines.length : nextHeadingIndex;
  const body = lines
    .slice(headingIndex + 1, bodyEndIndex)
    .join("\n")
    .trim();

  if (!body) {
    throw new Error(`CHANGELOG.md section for ${version} must not be empty`);
  }

  return {
    body,
    heading: lines[headingIndex],
    version,
  };
}

export function getReleasePackages(version) {
  return releasePackageHistory
    .filter(
      (releasePackage) => compareVersions(version, releasePackage.since) >= 0,
    )
    .map((releasePackage) => releasePackage.name);
}

export function buildReleaseNotes({ changelog, tag }) {
  const normalizedTag = normalizeReleaseTag(tag);
  const version = normalizedTag.slice(1);
  const section = extractChangelogSection(changelog, version);
  const packageLinks = getReleasePackages(version).map((packageName) => {
    return `- [\`${packageName}@${version}\`](https://www.npmjs.com/package/${packageName}/v/${version})`;
  });

  return [
    `## webaudio-kit ${version}`,
    section.body,
    "## Published Packages",
    packageLinks.join("\n"),
    "## Release References",
    [
      "- [Full changelog](https://github.com/i-afaqrashid/webaudio-kit/blob/main/CHANGELOG.md)",
      "- [npm package scope](https://www.npmjs.com/org/webaudio-kit)",
      "- [API reference](https://webaudio-kit.afaqrashid.com/docs/api)",
      "- [Recipes](https://webaudio-kit.afaqrashid.com/docs/recipes)",
      "- [Example apps](https://webaudio-kit.afaqrashid.com/docs/examples)",
      "- [Interactive demos](https://webaudio-kit.afaqrashid.com/demos)",
    ].join("\n"),
  ].join("\n\n");
}

function compareVersions(left, right) {
  const leftParts = left.split(".").map(Number);
  const rightParts = right.split(".").map(Number);

  for (let index = 0; index < 3; index += 1) {
    const diff = leftParts[index] - rightParts[index];

    if (diff !== 0) {
      return diff;
    }
  }

  return 0;
}

async function main() {
  const tag = normalizeReleaseTag(
    process.argv[2] ?? process.env.RELEASE_TAG ?? process.env.GITHUB_REF_NAME,
  );
  const changelog = await readFile(join(root, "CHANGELOG.md"), "utf8");

  process.stdout.write(`${buildReleaseNotes({ changelog, tag })}\n`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
