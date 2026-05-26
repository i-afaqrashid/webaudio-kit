# @webaudio-kit/cli

CLI helpers for browser audio projects using webaudio-kit.

## Generate an AI agent brief

```sh
npx @webaudio-kit/cli@latest agent-brief
pnpm dlx @webaudio-kit/cli agent-brief
yarn dlx @webaudio-kit/cli@latest agent-brief
```

## Package Manager Snippets

```sh
pnpm dlx @webaudio-kit/cli@latest agent-brief
npx @webaudio-kit/cli@latest agent-brief
yarn dlx @webaudio-kit/cli@latest agent-brief
bunx @webaudio-kit/cli@latest agent-brief
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

## Docs And Examples

- API reference: https://webaudio-kit.afaqrashid.com/docs/api
- Hooks vs Core: https://github.com/i-afaqrashid/webaudio-kit/blob/main/docs/hooks-vs-core.md
- Scope and limitations: https://github.com/i-afaqrashid/webaudio-kit/blob/main/docs/scope-and-limitations.md
- Recipes: https://webaudio-kit.afaqrashid.com/docs/recipes
- Example apps: https://webaudio-kit.afaqrashid.com/docs/examples
- Markdown docs: https://github.com/i-afaqrashid/webaudio-kit/tree/main/docs
- LLM docs index: https://webaudio-kit.afaqrashid.com/llms.txt
- Interactive demos: https://webaudio-kit.afaqrashid.com/demos

## Release History

Every npm version maps to a GitHub tag and a `CHANGELOG.md` section.

- Changelog: https://webaudio-kit.afaqrashid.com/changelog
- GitHub Releases: https://github.com/i-afaqrashid/webaudio-kit/releases
- npm versions: https://www.npmjs.com/package/@webaudio-kit/cli?activeTab=versions

The published npm tarball includes `CHANGELOG.md` so version history is
available with the package contents.
