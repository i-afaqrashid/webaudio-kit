# webaudio-kit

React and TypeScript primitives for serious browser audio apps.

> Build browser audio interfaces in React without fighting AudioContext.

`webaudio-kit` is a small browser audio toolkit for React apps that need tone
generation, frequency sweeps, volume controls, stereo panning, and analyser
data without hand-managing raw Web Audio node lifecycles.

![webaudio-kit demo](./docs/assets/demo.gif)

## Install

```sh
pnpm add @webaudio-kit/core @webaudio-kit/react
```

The packages target browser runtimes and Node `>=20.10` for local tooling.

## 30-second example

```tsx
import { AudioProvider, useTone } from "@webaudio-kit/react";

function App() {
  return (
    <AudioProvider>
      <ToneButton />
    </AudioProvider>
  );
}

function ToneButton() {
  const tone = useTone({
    frequency: 440,
    gain: 0.2,
    type: "sine",
  });

  return (
    <button onClick={() => void tone.play()}>
      {tone.isPlaying ? "Restart 440Hz" : "Play 440Hz"}
    </button>
  );
}
```

Browsers require audio playback to begin from a user gesture. `AudioProvider`
therefore creates and resumes `AudioContext` lazily when a hook action such as
`tone.play()` runs from a click or similar interaction.

## What v0.1 includes

- `@webaudio-kit/core`
  - `playTone()`
  - `playFrequencySweep()`
  - `dbToGain()`
  - `gainToDb()`
  - `clampFrequency()`
- `@webaudio-kit/react`
  - `AudioProvider`
  - `useAudioContext`
  - `useTone`
  - `useFrequencySweep`
  - `useVolume`
  - `useAnalyser`
- `apps/demo`
  - tone generator
  - 250Hz to 8000Hz sweep
  - analyser waveform canvas

## Local development

```sh
pnpm install
pnpm test
pnpm typecheck
pnpm build
pnpm demo:dev
pnpm demo:qa
pnpm smoke:pack
pnpm release:check
pnpm release:check:full
pnpm release:verify-tag v0.1.0
pnpm release:dry-run
pnpm verify
```

The demo runs on `http://127.0.0.1:5173`.

`pnpm demo:qa` runs the demo through Chromium, Firefox, and WebKit with
Playwright, then writes a demo screenshot, WebM, and GIF under `docs/assets/`.
`pnpm smoke:pack` packs both publishable packages and imports them from a clean
temporary app.

`pnpm release:check` runs the full verification gate and package smoke check
used before tagging a release.

`pnpm release:check:full` adds browser demo QA on top of the release check. Run
it before publishing when Playwright browsers and `ffmpeg` are installed.

`pnpm release:verify-tag` is the same stable-semver tag guard used by the
GitHub publish workflow. It rejects prerelease tags, package version drift,
private packages, missing public publish config, and mismatched repository
metadata.

`pnpm release:dry-run` rebuilds and smoke-tests the package tarballs, checks npm
for already-published versions, then runs `npm publish --dry-run` in the same
package order used by the tag-gated publish workflow.

## Package Names

The intended npm packages are:

- `@webaudio-kit/core`
- `@webaudio-kit/react`

## Safety note

Default playback gain is intentionally quiet at `0.2`. Keep volume low when
testing headphones or hearing-test-style prototypes.

This library is for building browser audio interfaces and prototypes. It is not
a certified audiology or medical testing system.

## Roadmap

- richer waveform and spectrum visualizers
- microphone input and permission helpers
- AudioWorklet helpers for low-latency processors
- Svelte/Vue adapters if React primitives prove useful first

## Project docs

- [Product plan](./product-plan.md)
- [Publicity plan](./publicity-plan.md)
- [Testing](./TESTING.md)
- [Release checklist](./RELEASE.md)
- [Security policy](./SECURITY.md)
- [Support](./SUPPORT.md)
- [Open source expectations](./OPEN_SOURCE.md)
- [Code of conduct](./CODE_OF_CONDUCT.md)
