#!/usr/bin/env node
import { cp, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = dirname(
  fileURLToPath(new URL("../package.json", import.meta.url)),
);
const packDir = join(root, ".release-packages");
const skipBuild = process.argv.includes("--skip-build");
const examples = [
  "vite-react",
  "next-app-router",
  "plain-react",
  "vite-tone-panel",
  "next-provider-example",
  "audio-test-mode",
];

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

const tempRoot = await mkdtemp(join(tmpdir(), "webaudio-kit-examples-"));

try {
  for (const example of examples) {
    const source = join(root, "examples", example);
    const target = join(tempRoot, example);

    await cp(source, target, {
      recursive: true,
      filter: (path) => {
        return !path.includes("node_modules") && !path.includes(".next");
      },
    });

    await writeFile(
      join(target, "pnpm-workspace.yaml"),
      `packages:
  - .
overrides:
  "@webaudio-kit/core": "file:${join(packDir, coreTarball)}"
  "@webaudio-kit/react": "file:${join(packDir, reactTarball)}"
`,
    );

    run("pnpm", ["install", "--ignore-scripts"], target);
    run("pnpm", ["build"], target);
    console.log(`example ok: ${example}`);
  }
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}

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
