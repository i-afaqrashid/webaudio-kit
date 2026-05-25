import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

export type ChangelogSection = {
  title: string;
  items: string[];
};

export type ChangelogRelease = {
  version: string;
  date: string;
  sections: ChangelogSection[];
};

const packageNames = [
  "@webaudio-kit/core",
  "@webaudio-kit/react",
  "@webaudio-kit/cli",
] as const;

export function getPackageLinks(version: string) {
  return packageNames.map((name) => ({
    name,
    href: `https://www.npmjs.com/package/${name}/v/${version}`,
  }));
}

export function getGitHubReleaseUrl(version: string) {
  return `https://github.com/i-afaqrashid/webaudio-kit/releases/tag/v${version}`;
}

export function parseChangelog(source: string): ChangelogRelease[] {
  const releases: ChangelogRelease[] = [];
  let currentRelease: ChangelogRelease | undefined;
  let currentSection: ChangelogSection | undefined;

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    const releaseMatch =
      /^##\s+(\d+\.\d+\.\d+)\s+-\s+(\d{4}-\d{2}-\d{2})$/.exec(line);

    if (releaseMatch) {
      currentRelease = {
        version: releaseMatch[1],
        date: releaseMatch[2],
        sections: [],
      };
      releases.push(currentRelease);
      currentSection = undefined;
      continue;
    }

    const sectionMatch = /^###\s+(.+)$/.exec(line);
    if (sectionMatch && currentRelease) {
      currentSection = {
        title: sectionMatch[1],
        items: [],
      };
      currentRelease.sections.push(currentSection);
      continue;
    }

    if (line.startsWith("- ") && currentSection) {
      currentSection.items.push(line.slice(2));
      continue;
    }

    if (line && currentSection && currentSection.items.length > 0) {
      const lastIndex = currentSection.items.length - 1;
      currentSection.items[lastIndex] =
        `${currentSection.items[lastIndex]} ${line}`.replace(/\s+/g, " ");
    }
  }

  return releases;
}

export function getChangelogReleases() {
  return parseChangelog(readFileSync(findChangelogPath(), "utf8"));
}

function findChangelogPath() {
  let directory = process.cwd();

  for (let depth = 0; depth < 8; depth += 1) {
    const candidate = join(directory, "CHANGELOG.md");

    if (existsSync(candidate)) {
      return candidate;
    }

    const parent = dirname(directory);
    if (parent === directory) {
      break;
    }

    directory = parent;
  }

  throw new Error("Could not find root CHANGELOG.md");
}
