# Testing

## Automated Checks

Run the full local gate:

```sh
pnpm verify
pnpm bench
pnpm smoke:pack
pnpm examples:check
pnpm release:check
pnpm release:verify-tag v1.5.1
```

`pnpm verify` runs unit tests, TypeScript, package builds, demo build, site
build, lint, and format checks.

`pnpm smoke:pack` packs `@webaudio-kit/core`, `@webaudio-kit/react`, and
`@webaudio-kit/cli`, installs the tarballs into a clean temporary app, imports
the public APIs, and runs the CLI bin.

`pnpm examples:check` installs packed tarballs into clean temporary Vite and
Next apps, then builds the standalone examples.

`pnpm release:check` runs `pnpm verify`, `pnpm smoke:pack`, and
`pnpm examples:check`.

`pnpm release:verify-tag` enforces the same stable release-tag and package
metadata checks used by the npm publish workflow.

## Benchmarks

Use the benchmark suite to watch local performance trends while changing core
audio primitives, analyser rendering, or React hook behavior:

```sh
pnpm bench
```

Current benchmark coverage:

- Audio math helpers converting dB/gain values and clamping playback
  frequencies across 4,096-value batches, plus note-name formatting.
- `playTone` graph setup, finite-duration tone scheduling, stop cleanup, and
  mixed tone/sweep/noise scheduling with fake Web Audio nodes.
- `playFrequencySweep` ramp scheduling across realistic sweep ranges.
- Analyser frame reads and waveform coordinate generation for 2,048-sample
  frames.
- `AudioProvider`, `useTone`, `useFrequencySweep`, `useNoise`, and `useVolume`
  render and control overhead with a fake `AudioContext`.

Benchmark results vary by machine and current system load. Treat them as local
comparison signals, not hard pass/fail thresholds.

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

This runs the release gate, browser demo QA, package smoke test, npm registry
republish check, and npm publish dry-run.

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
- Play the pink-noise burst.
- Confirm the analyser visibly reacts.
- Confirm the disclaimer is visible.

Do not use the demo as medical or audiology software.
