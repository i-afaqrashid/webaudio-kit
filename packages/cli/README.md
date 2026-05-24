# @webaudio-kit/cli

CLI helpers for webaudio-kit projects.

## Generate an AI agent brief

```sh
pnpm dlx @webaudio-kit/cli agent-brief
```

The command writes `AGENTS.md` by default. The generated brief points coding
agents at the webaudio-kit docs, npm packages, examples, browser autoplay
constraints, safe gain defaults, and the project boundary that this is not
medical or audiology software.

```sh
pnpm dlx @webaudio-kit/cli agent-brief --out docs/AI_AGENT.md
pnpm dlx @webaudio-kit/cli agent-brief --target codex --package-manager npm
pnpm dlx @webaudio-kit/cli agent-brief --force
```

Supported targets are `generic`, `codex`, `claude`, `gemini`, `opencode`, and
`antigravity`.
