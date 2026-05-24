# AI Agent Brief CLI

`@webaudio-kit/cli` can generate an `AGENTS.md` style file for projects that use
webaudio-kit and want coding agents to start with the right public context.

```sh
pnpm dlx @webaudio-kit/cli agent-brief
```

The generated brief is generic and public. It points agents such as Codex,
Claude Code, Gemini CLI, OpenCode, Antigravity, and similar tools to the docs,
npm package pages, GitHub repository, examples, browser audio rules, and safety
boundary before they edit code.

## Options

```sh
webaudio-kit agent-brief --out docs/AI_AGENT.md
webaudio-kit agent-brief --target codex
webaudio-kit agent-brief --package-manager npm
webaudio-kit agent-brief --force
```

- `--out <path>` writes to a custom path. The default is `AGENTS.md`.
- `--target <agent>` supports `generic`, `codex`, `claude`, `gemini`,
  `opencode`, and `antigravity`.
- `--package-manager <name>` supports `pnpm`, `npm`, `yarn`, and `bun`.
- `--force` overwrites an existing file.

## Generated Guidance

The generated file includes:

- GitHub, docs, npm, and examples links.
- Install command for `@webaudio-kit/core` and `@webaudio-kit/react`.
- Browser autoplay guidance: call playback from a user gesture.
- The no import-time `AudioContext` boundary.
- Safe default gain guidance.
- React, Vite, and Next.js notes.
- A non-medical scope warning for hearing-test-style prototypes.

Use this when opening an issue, starting a coding-agent session, or handing a
project to a contributor who needs the public webaudio-kit context quickly.
