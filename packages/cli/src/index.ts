#!/usr/bin/env node
import { mkdir, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const agentTargets = [
  "generic",
  "codex",
  "claude",
  "gemini",
  "opencode",
  "antigravity",
] as const;
const packageManagers = ["pnpm", "npm", "yarn", "bun"] as const;

export type AgentTarget = (typeof agentTargets)[number];
export type PackageManager = (typeof packageManagers)[number];

export type AgentBriefOptions = {
  packageManager?: PackageManager;
  target?: AgentTarget;
};

export type ParsedCliArgs = {
  command: "agent-brief" | "help";
  force: boolean;
  out: string;
  packageManager: PackageManager;
  target: AgentTarget;
};

export type RunCliOptions = {
  cwd?: string;
};

export type RunCliResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

const targetLabels: Record<AgentTarget, string> = {
  generic: "generic coding agents",
  codex: "Codex",
  claude: "Claude Code",
  gemini: "Gemini CLI",
  opencode: "OpenCode",
  antigravity: "Antigravity",
};

export function buildAgentBrief(options: AgentBriefOptions = {}): string {
  const packageManager = options.packageManager ?? "pnpm";
  const target = options.target ?? "generic";
  const installCommand = getInstallCommand(packageManager);

  return `# webaudio-kit Agent Brief

Use this brief with Codex, Claude Code, Gemini CLI, OpenCode, Antigravity, or another coding agent before changing a project that uses webaudio-kit.

Target agent: ${targetLabels[target]}.

## Read First

- GitHub: https://github.com/i-afaqrashid/webaudio-kit
- Docs: https://webaudio-kit.afaqrashid.com/docs
- Core package: https://www.npmjs.com/package/@webaudio-kit/core
- React package: https://www.npmjs.com/package/@webaudio-kit/react
- Examples: https://github.com/i-afaqrashid/webaudio-kit/tree/main/examples

Ask the agent to read the docs and examples before changing code. Prefer the latest npm package documentation and public API over guessing internal behavior.

## Install

\`\`\`sh
${installCommand}
\`\`\`

## Public Packages

- \`@webaudio-kit/core\`: browser-safe playback helpers, pitch helpers, frequency clamping, and math utilities.
- \`@webaudio-kit/react\`: \`AudioProvider\`, playback hooks, volume controls, analyser access, and canvas visualizers.

## Safe Browser Audio Rules

- Keep no import-time AudioContext creation. Create or resume audio only after a user gesture.
- Keep first-run volume low. The provider default gain is \`0.2\`; demos should use conservative gain ranges.
- Clamp playable frequencies unless a product has a strong reason to do otherwise.
- Treat webaudio-kit as browser audio prototype tooling, not medical or audiology software.
- Do not add hearing diagnosis, calibration, or clinical claims without a separately validated certified system.

## React And Framework Notes

- Put \`AudioProvider\` around the interactive audio controls.
- In Next.js App Router, keep hook-based controls inside a client component.
- Call \`play()\` from a click, tap, key press, or similar user action so browser autoplay policies can allow audio.
- Use \`WaveformCanvas\` or \`SpectrumCanvas\` when the UI needs visible analyser feedback.

## Useful APIs

- Playback: \`useTone\`, \`useFrequencySweep\`, \`useNoise\`, \`playTone\`, \`playFrequencySweep\`, \`playNoise\`
- State and routing: \`AudioProvider\`, \`useAudioContext\`, \`useVolume\`, \`useAnalyser\`
- Visualizers: \`WaveformCanvas\`, \`SpectrumCanvas\`
- Helpers: \`dbToGain\`, \`gainToDb\`, \`clampFrequency\`, \`midiToFrequency\`, \`frequencyToMidi\`, \`frequencyToNoteName\`

## Suggested Agent Prompt

You are working in a React or TypeScript app that uses webaudio-kit. Read the public docs, npm package pages, and examples linked above before editing. Preserve lazy AudioContext behavior, safe default gain, browser autoplay compatibility, and the non-medical scope boundary. Prefer public APIs from \`@webaudio-kit/core\` and \`@webaudio-kit/react\` over copying internals.
`;
}

export function parseCliArgs(argv: string[]): ParsedCliArgs {
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) {
    return {
      command: "help",
      force: false,
      out: "AGENTS.md",
      packageManager: "pnpm",
      target: "generic",
    };
  }

  const [command, ...args] = argv;

  if (command !== "agent-brief") {
    throw new Error(`Unknown command: ${command}`);
  }

  const parsed: ParsedCliArgs = {
    command,
    force: false,
    out: "AGENTS.md",
    packageManager: "pnpm",
    target: "generic",
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--force") {
      parsed.force = true;
      continue;
    }

    if (arg === "--out") {
      parsed.out = readOptionValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--target") {
      parsed.target = parseTarget(readOptionValue(args, index, arg));
      index += 1;
      continue;
    }

    if (arg === "--package-manager") {
      parsed.packageManager = parsePackageManager(
        readOptionValue(args, index, arg),
      );
      index += 1;
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  return parsed;
}

export async function runCli(
  argv: string[],
  options: RunCliOptions = {},
): Promise<RunCliResult> {
  const cwd = options.cwd ?? process.cwd();

  try {
    const parsed = parseCliArgs(argv);

    if (parsed.command === "help") {
      return { exitCode: 0, stdout: `${getHelpText()}\n`, stderr: "" };
    }

    const outputPath = resolve(cwd, parsed.out);

    if (!parsed.force && (await pathExists(outputPath))) {
      return {
        exitCode: 1,
        stdout: "",
        stderr: `${parsed.out} already exists. Re-run with --force to overwrite it.\n`,
      };
    }

    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(
      outputPath,
      buildAgentBrief({
        packageManager: parsed.packageManager,
        target: parsed.target,
      }),
      "utf8",
    );

    return {
      exitCode: 0,
      stdout: `Wrote ${parsed.out}\n`,
      stderr: "",
    };
  } catch (error) {
    return {
      exitCode: 1,
      stdout: "",
      stderr: `${error instanceof Error ? error.message : String(error)}\n`,
    };
  }
}

function getInstallCommand(packageManager: PackageManager): string {
  if (packageManager === "npm") {
    return "npm install @webaudio-kit/core @webaudio-kit/react";
  }

  if (packageManager === "yarn") {
    return "yarn add @webaudio-kit/core @webaudio-kit/react";
  }

  return `${packageManager} add @webaudio-kit/core @webaudio-kit/react`;
}

function getHelpText(): string {
  return `webaudio-kit

Usage:
  webaudio-kit agent-brief [options]

Options:
  --out <path>                  Output path. Defaults to AGENTS.md.
  --target <agent>              generic, codex, claude, gemini, opencode, antigravity.
  --package-manager <manager>   pnpm, npm, yarn, bun.
  --force                       Overwrite an existing output file.
  -h, --help                    Show help.`;
}

function readOptionValue(
  args: string[],
  index: number,
  option: string,
): string {
  const value = args[index + 1];

  if (!value || value.startsWith("--")) {
    throw new Error(`${option} requires a value`);
  }

  return value;
}

function parseTarget(value: string): AgentTarget {
  if (isIncluded(agentTargets, value)) {
    return value;
  }

  throw new Error(`Unsupported target: ${value}`);
}

function parsePackageManager(value: string): PackageManager {
  if (isIncluded(packageManagers, value)) {
    return value;
  }

  throw new Error(`Unsupported package manager: ${value}`);
}

function isIncluded<const Values extends readonly string[]>(
  values: Values,
  value: string,
): value is Values[number] {
  return values.includes(value);
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error) {
      return error.code !== "ENOENT";
    }

    throw error;
  }
}

async function main() {
  const result = await runCli(process.argv.slice(2));

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  process.exitCode = result.exitCode;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main();
}
