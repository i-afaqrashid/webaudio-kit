#!/usr/bin/env node
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = dirname(
  fileURLToPath(new URL("../package.json", import.meta.url)),
);
const packDir = join(root, ".release-packages");
const skipBuild = process.argv.includes("--skip-build");
const rootPackage = JSON.parse(
  await readFile(join(root, "package.json"), "utf8"),
);

if (!skipBuild) {
  run("pnpm", ["build"], root);
}

await rm(packDir, { recursive: true, force: true });
run(
  "pnpm",
  ["-r", "--filter", "./packages/*", "pack", "--pack-destination", packDir],
  root,
);

const tarballs = await readdir(packDir);
const coreTarball = tarballs.find((file) =>
  file.startsWith("webaudio-kit-core-"),
);
const reactTarball = tarballs.find((file) =>
  file.startsWith("webaudio-kit-react-"),
);

if (!coreTarball || !reactTarball) {
  throw new Error(`Missing packed tarballs in ${packDir}`);
}

const smokeDir = await mkdtemp(join(tmpdir(), "webaudio-kit-smoke-"));

await writeFile(
  join(smokeDir, "package.json"),
  JSON.stringify(
    {
      private: true,
      type: "module",
      packageManager: rootPackage.packageManager,
      dependencies: {
        "@webaudio-kit/core": `file:${join(packDir, coreTarball)}`,
        "@webaudio-kit/react": `file:${join(packDir, reactTarball)}`,
        react: "^19.0.0",
      },
    },
    null,
    2,
  ),
);

await writeFile(
  join(smokeDir, "pnpm-workspace.yaml"),
  `packages:
  - .
overrides:
  "@webaudio-kit/core": "file:${join(packDir, coreTarball)}"
`,
);

await writeFile(
  join(smokeDir, "smoke.mjs"),
  `import { clampFrequency, dbToGain } from "@webaudio-kit/core";
import { AudioProvider, useTone } from "@webaudio-kit/react";

if (clampFrequency(30_000) !== 20_000) {
  throw new Error("core clampFrequency export failed");
}

if (Math.abs(dbToGain(-6) - 0.501187) > 0.00001) {
  throw new Error("core dbToGain export failed");
}

if (typeof AudioProvider !== "function" || typeof useTone !== "function") {
  throw new Error("react exports failed");
}

console.log("smoke ok");
`,
);

run("pnpm", ["install", "--ignore-scripts"], smokeDir);
run("node", ["smoke.mjs"], smokeDir);

console.log(`Packed packages smoke-tested from ${packDir}`);

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: false,
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed`);
  }
}
