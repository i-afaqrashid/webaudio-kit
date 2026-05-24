# Contributing to webaudio-kit

Thanks for helping improve `webaudio-kit`.

## Local Setup

```sh
pnpm install
pnpm verify
```

The demo runs at `http://127.0.0.1:5173`:

```sh
pnpm demo:dev
```

## Repository Map

```txt
apps/demo        Manual browser demo and demo QA target
docs             Technical guides, examples, safety, and deployment notes
packages/core    Browser-safe Web Audio primitives and math helpers
packages/react   React provider and hook ergonomics
scripts          Release, demo QA, and package smoke scripts
```

## Development Rules

- Keep 1.0 focused on browser-safe tone generation, frequency sweeps, volume,
  panning, and analyser data.
- Do not create `AudioContext` at module import time.
- Keep default playback gain quiet. The current default is `0.2`.
- Do not describe the project as medical or audiology software.
- Add tests before changing core playback or React hook behavior.

## Checks

Run the full local gate before opening a PR:

```sh
pnpm verify
pnpm smoke:pack
```

For performance-sensitive changes, also run:

```sh
pnpm bench
```

Benchmark results vary by machine, so include relative observations rather than
hard claims.

For browser demo QA:

```sh
pnpm demo:qa
```

`demo:qa` uses Playwright to exercise the demo in Chromium, Firefox, and
WebKit when those browser engines are installed locally.

See `TESTING.md` for the manual audio QA checklist.

## Docs And Copy

- Put user-facing technical docs in `docs/`.
- Keep package-specific API notes in `packages/*/README.md`.
- Keep release and governance docs at the repository root.
- Any hearing-test-style example must include the non-medical disclaimer.
- Prefer concrete code samples over broad marketing copy.

## Release Notes

Update `CHANGELOG.md` for user-facing changes.

Release work should follow `RELEASE.md`.
