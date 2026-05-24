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

## Development Rules

- Keep v0.1 focused on browser-safe tone generation, frequency sweeps, volume,
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

For browser demo QA:

```sh
pnpm demo:qa
```

`demo:qa` uses Playwright to exercise the demo in Chromium, Firefox, and
WebKit when those browser engines are installed locally.

See `TESTING.md` for the manual audio QA checklist.

## Release Notes

Update `CHANGELOG.md` for user-facing changes.

Release work should follow `RELEASE.md`.
