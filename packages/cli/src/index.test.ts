import { mkdtemp, readFile, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import {
  buildAgentBrief,
  isCliEntrypoint,
  parseCliArgs,
  runCli,
} from "./index";

describe("buildAgentBrief", () => {
  it("generates a public AI agent brief with docs, package, and safety context", () => {
    const brief = buildAgentBrief({
      packageManager: "pnpm",
      target: "generic",
    });

    expect(brief).toContain("# webaudio-kit Agent Brief");
    expect(brief).toContain("Codex");
    expect(brief).toContain("Claude Code");
    expect(brief).toContain("Gemini CLI");
    expect(brief).toContain("OpenCode");
    expect(brief).toContain("Antigravity");
    expect(brief).toContain("https://github.com/i-afaqrashid/webaudio-kit");
    expect(brief).toContain("https://www.npmjs.com/package/@webaudio-kit/core");
    expect(brief).toContain(
      "https://www.npmjs.com/package/@webaudio-kit/react",
    );
    expect(brief).toContain("https://webaudio-kit.afaqrashid.com/docs");
    expect(brief).toContain("pnpm add @webaudio-kit/core @webaudio-kit/react");
    expect(brief).toContain("no import-time AudioContext");
    expect(brief).toContain("not medical or audiology software");
    expect(brief).not.toContain("/Users/");
    expect(brief).not.toContain("Documents/IMPORTANT");
  });

  it("uses the requested package manager in install examples", () => {
    expect(
      buildAgentBrief({ packageManager: "npm", target: "codex" }),
    ).toContain("npm install @webaudio-kit/core @webaudio-kit/react");

    expect(
      buildAgentBrief({ packageManager: "bun", target: "gemini" }),
    ).toContain("bun add @webaudio-kit/core @webaudio-kit/react");
  });
});

describe("parseCliArgs", () => {
  it("parses agent-brief options", () => {
    expect(
      parseCliArgs([
        "agent-brief",
        "--out",
        "ai/AGENTS.md",
        "--target",
        "codex",
        "--package-manager",
        "npm",
        "--force",
      ]),
    ).toEqual({
      command: "agent-brief",
      force: true,
      out: "ai/AGENTS.md",
      packageManager: "npm",
      target: "codex",
    });
  });

  it("defaults to a generic AGENTS.md brief", () => {
    expect(parseCliArgs(["agent-brief"])).toEqual({
      command: "agent-brief",
      force: false,
      out: "AGENTS.md",
      packageManager: "pnpm",
      target: "generic",
    });
  });
});

describe("runCli", () => {
  it("writes the generated brief to disk", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "webaudio-kit-cli-"));
    const out = "docs/AI_AGENT.md";

    const result = await runCli(["agent-brief", "--out", out], { cwd });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Wrote docs/AI_AGENT.md");
    await expect(readFile(join(cwd, out), "utf8")).resolves.toContain(
      "# webaudio-kit Agent Brief",
    );
  });

  it("refuses to overwrite existing files without --force", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "webaudio-kit-cli-"));
    await writeFile(join(cwd, "AGENTS.md"), "existing");

    const result = await runCli(["agent-brief"], { cwd });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("already exists");
    await expect(readFile(join(cwd, "AGENTS.md"), "utf8")).resolves.toBe(
      "existing",
    );
  });
});

describe("isCliEntrypoint", () => {
  it("treats package-manager bin symlinks as direct CLI execution", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "webaudio-kit-cli-"));
    const target = join(cwd, "dist-index.js");
    const link = join(cwd, "webaudio-kit");

    await writeFile(target, "");
    await symlink(target, link);

    expect(isCliEntrypoint(link, pathToFileURL(target).href)).toBe(true);
  });
});
