# Testing

## Automated Checks

Run the full local gate:

```sh
pnpm verify
pnpm smoke:pack
pnpm release:check
```

`pnpm verify` runs unit tests, TypeScript, package builds, demo build, lint, and
format checks.

`pnpm smoke:pack` packs `@webaudio-kit/core` and `@webaudio-kit/react`, installs
the tarballs into a clean temporary app, and imports the public APIs.

`pnpm release:check` runs `pnpm verify` and `pnpm smoke:pack`.

## Browser Demo QA

Install Playwright browsers once:

```sh
pnpm exec playwright install chromium firefox webkit
```

Then run:

```sh
pnpm demo:qa
```

This starts the demo, exercises it in Chromium, Firefox, and WebKit, and writes
demo artifacts under `docs/assets/`.

For a full local release rehearsal:

```sh
pnpm release:check:full
pnpm release:dry-run
```

This runs the release gate, browser demo QA, and npm publish dry-run.

## Manual Audio QA

Manual listening is still required before publishing because automated tests
cannot judge loudness or subjective audio quality.

Checklist:

- Start from a low system volume.
- Open `http://127.0.0.1:5173/`.
- Click `Play tone`.
- Confirm `Stop` silences playback.
- Move frequency, gain, and pan controls.
- Run the 250Hz to 8000Hz sweep.
- Confirm the analyser visibly reacts.
- Confirm the disclaimer is visible.

Do not use the demo as medical or audiology software.
