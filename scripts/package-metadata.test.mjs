import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workspace = JSON.parse(readFileSync("package.json", "utf8"));
const packageVersion = workspace.version;
const supportedNodeFloor = ">=20.19";
const packageManager = "pnpm@10.33.4";

const publishableManifests = [
  ["root workspace", "package.json"],
  ["@webaudio-kit/core", "packages/core/package.json"],
  ["@webaudio-kit/react", "packages/react/package.json"],
  ["@webaudio-kit/cli", "packages/cli/package.json"],
];

test("package engine metadata supports the Node 20 floor", () => {
  for (const [name, manifestPath] of publishableManifests) {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

    assert.equal(
      manifest.engines?.node,
      supportedNodeFloor,
      `${name} should document the supported Node floor`,
    );
  }

  assert.match(readFileSync("README.md", "utf8"), /Node `>=20\.19`/);
  assert.match(readFileSync("RELEASE.md", "utf8"), /Node `>=20\.19`/);
  assert.equal(
    workspace.packageManager,
    packageManager,
    "workspace package manager should support the Node 20 floor",
  );
  assert.match(readFileSync("RELEASE.md", "utf8"), /pnpm `10\.33\.4`/);
});

test("CI covers the supported Node floor", () => {
  const ci = readFileSync(".github/workflows/ci.yml", "utf8");
  const benchmarks = readFileSync(".github/workflows/benchmarks.yml", "utf8");
  const publish = readFileSync(".github/workflows/publish.yml", "utf8");

  assert.match(ci, /node-version:\s*\[20\.19,\s*22,\s*24\]/);
  assert.match(ci, /node-version:\s*20\.19/);
  assert.match(ci, /pnpm-build-node-20\.19/);
  assert.match(ci, /pnpm-audit-node-20\.19/);
  assert.match(benchmarks, /node-version:\s*20\.19/);
  assert.match(benchmarks, /pnpm-bench-node-20\.19/);

  for (const [name, workflow] of [
    ["CI", ci],
    ["benchmarks", benchmarks],
    ["publish", publish],
  ]) {
    assert.match(
      workflow,
      /npm install --global pnpm@10\.33\.4/,
      `${name} should install pnpm directly so Node 20 is not blocked by Corepack`,
    );
    assert.doesNotMatch(
      workflow,
      /corepack prepare pnpm@/,
      `${name} should avoid Corepack's Node 20 wrapper failure`,
    );
  }
});

test("React package uses core as an explicit peer dependency", () => {
  const reactManifest = JSON.parse(
    readFileSync("packages/react/package.json", "utf8"),
  );

  assert.equal(reactManifest.dependencies?.["@webaudio-kit/core"], undefined);
  assert.equal(
    reactManifest.peerDependencies?.["@webaudio-kit/core"],
    `^${packageVersion}`,
  );
  assert.equal(
    reactManifest.devDependencies?.["@webaudio-kit/core"],
    "workspace:*",
  );
  assert.match(
    readFileSync("packages/react/README.md", "utf8"),
    /@webaudio-kit\/core` is a peer dependency/,
  );
  assert.match(
    readFileSync("docs/architecture.md", "utf8"),
    /@webaudio-kit\/react` declares `@webaudio-kit\/core` as a peer dependency/,
  );
});
