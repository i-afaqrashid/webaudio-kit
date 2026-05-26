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

## Docs And Examples

- API reference: https://webaudio-kit.afaqrashid.com/docs/api
- Recipes: https://webaudio-kit.afaqrashid.com/docs/recipes
- Example apps: https://webaudio-kit.afaqrashid.com/docs/examples
- Interactive demos: https://webaudio-kit.afaqrashid.com/demos

## Release History

Every npm version maps to a GitHub tag and a `CHANGELOG.md` section.

- Changelog: https://webaudio-kit.afaqrashid.com/changelog
- GitHub Releases: https://github.com/i-afaqrashid/webaudio-kit/releases
- npm versions: https://www.npmjs.com/package/@webaudio-kit/cli?activeTab=versions

The published npm tarball includes `CHANGELOG.md` so version history is
available with the package contents.
