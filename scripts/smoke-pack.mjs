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
const cliTarball = tarballs.find((file) =>
  file.startsWith("webaudio-kit-cli-"),
);

if (!coreTarball || !reactTarball || !cliTarball) {
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
        "@webaudio-kit/cli": `file:${join(packDir, cliTarball)}`,
        "@webaudio-kit/core": `file:${join(packDir, coreTarball)}`,
        "@webaudio-kit/react": `file:${join(packDir, reactTarball)}`,
        react: "^19.2.6",
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
  "@webaudio-kit/cli": "file:${join(packDir, cliTarball)}"
`,
);

await writeFile(
  join(smokeDir, "smoke.mjs"),
  `import { buildAgentBrief } from "@webaudio-kit/cli";
import { readFile } from "node:fs/promises";
import { clampFrequency, dbToGain, frequencyToNoteName, midiToFrequency } from "@webaudio-kit/core";
import {
  AudioProvider,
  SpectrumCanvas,
  WaveformCanvas,
  createDefaultAudioTestModeSteps,
  useAudioTestMode,
  useNoise,
  useTone,
} from "@webaudio-kit/react";

if (!buildAgentBrief().includes("webaudio-kit Agent Brief")) {
  throw new Error("cli buildAgentBrief export failed");
}

if (clampFrequency(30_000) !== 20_000) {
  throw new Error("core clampFrequency export failed");
}

if (Math.abs(dbToGain(-6) - 0.501187) > 0.00001) {
  throw new Error("core dbToGain export failed");
}

if (Math.abs(midiToFrequency(69) - 440) > 0.00001) {
  throw new Error("core midiToFrequency export failed");
}

if (frequencyToNoteName(440) !== "A4") {
  throw new Error("core frequencyToNoteName export failed");
}

if (
  typeof AudioProvider !== "function" ||
  typeof SpectrumCanvas !== "function" ||
  typeof WaveformCanvas !== "function" ||
  typeof createDefaultAudioTestModeSteps !== "function" ||
  typeof useAudioTestMode !== "function" ||
  typeof useNoise !== "function" ||
  typeof useTone !== "function"
) {
  throw new Error("react exports failed");
}

if (createDefaultAudioTestModeSteps().length < 5) {
  throw new Error("react audio test mode defaults failed");
}

const packageChangelogs = [
  "node_modules/@webaudio-kit/core/CHANGELOG.md",
  "node_modules/@webaudio-kit/react/CHANGELOG.md",
  "node_modules/@webaudio-kit/cli/CHANGELOG.md",
];

for (const changelogPath of packageChangelogs) {
  const changelog = await readFile(changelogPath, "utf8");
  if (!changelog.includes("## ${rootPackage.version} -")) {
    throw new Error(\`\${changelogPath} does not include the current release notes\`);
  }
}

console.log("smoke ok");
`,
);

run("pnpm", ["install", "--ignore-scripts"], smokeDir);

run(
  join(
    smokeDir,
    "node_modules",
    ".bin",
    process.platform === "win32" ? "webaudio-kit.cmd" : "webaudio-kit",
  ),
  ["agent-brief", "--out", "AGENTS.md", "--target", "codex"],
  smokeDir,
);

const generatedBrief = await readFile(join(smokeDir, "AGENTS.md"), "utf8");
if (!generatedBrief.includes("Target agent: Codex.")) {
  throw new Error("cli bin failed to generate the requested agent brief");
}

const reactEntry = await readFile(
  join(smokeDir, "node_modules/@webaudio-kit/react/dist/index.js"),
  "utf8",
);
if (!/^["']use client["'];/.test(reactEntry.trimStart())) {
  throw new Error("react package entry must preserve the use client directive");
}

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
