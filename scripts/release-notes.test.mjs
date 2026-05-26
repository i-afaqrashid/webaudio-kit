import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  buildReleaseNotes,
  extractChangelogSection,
  getReleasePackages,
  normalizeReleaseTag,
} from "./release-notes.mjs";

const changelog = `# Changelog

## 1.5.1 - 2026-05-25

### Fixed

- Keep replacement playback alive.

### Added

- Add release-note coverage.

## 1.5.0 - 2026-05-25

### Added

- Add test mode.
`;

test("normalizeReleaseTag accepts stable semver tags", () => {
  assert.equal(normalizeReleaseTag("v1.5.1"), "v1.5.1");
  assert.equal(normalizeReleaseTag("refs/tags/v1.5.1"), "v1.5.1");
});

test("normalizeReleaseTag rejects prerelease and missing tags", () => {
  assert.throws(() => normalizeReleaseTag(), /Release tag is required/);
  assert.throws(
    () => normalizeReleaseTag("v1.5.1-beta.1"),
    /stable semver tag/,
  );
});

test("extractChangelogSection returns exactly one version body", () => {
  const section = extractChangelogSection(changelog, "1.5.1");

  assert.equal(section.heading, "## 1.5.1 - 2026-05-25");
  assert.match(section.body, /Keep replacement playback alive/);
  assert.doesNotMatch(section.body, /Add test mode/);
});

test("buildReleaseNotes includes package links and release references", () => {
  const notes = buildReleaseNotes({ changelog, tag: "v1.5.1" });

  assert.match(notes, /## webaudio-kit 1\.5\.1/);
  assert.match(notes, /@webaudio-kit\/core@1\.5\.1/);
  assert.match(notes, /@webaudio-kit\/react@1\.5\.1/);
  assert.match(notes, /@webaudio-kit\/cli@1\.5\.1/);
  assert.match(notes, /Full changelog/);
  assert.match(notes, /https:\/\/webaudio-kit\.afaqrashid\.com\/docs/);
});

test("current release notes include AudioProvider state machine docs", () => {
  const rootChangelog = readFileSync("CHANGELOG.md", "utf8");
  const notes = buildReleaseNotes({ changelog: rootChangelog, tag: "v1.9.6" });

  assert.match(notes, /AudioProvider state machine/i);
  assert.match(notes, /custom `idle` state/i);
  assert.match(notes, /AudioStateBadge/);
  assert.match(notes, /@webaudio-kit\/cli@1\.9\.6/);
});

test("getReleasePackages reflects package history", () => {
  assert.deepEqual(getReleasePackages("1.3.0"), [
    "@webaudio-kit/core",
    "@webaudio-kit/react",
  ]);
  assert.deepEqual(getReleasePackages("1.4.0"), [
    "@webaudio-kit/core",
    "@webaudio-kit/react",
    "@webaudio-kit/cli",
  ]);
});
