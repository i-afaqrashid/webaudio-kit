# webaudio-kit

React and TypeScript primitives for serious browser audio apps.

> Build browser audio interfaces in React without fighting AudioContext.

`webaudio-kit` is a small browser audio toolkit for React apps that need tone
generation, frequency sweeps, noise bursts, volume controls, stereo panning,
pitch helpers, and analyser data without hand-managing raw Web Audio node
lifecycles.

![webaudio-kit demo](./docs/assets/demo.gif)

## Install

```sh
pnpm add @webaudio-kit/core @webaudio-kit/react
```

Optional CLI helper:

```sh
pnpm dlx @webaudio-kit/cli agent-brief
```

The packages target browser runtimes and Node `>=22.13` for local tooling.
`@webaudio-kit/react` supports React `>=18.3` and ships as a client entry for
Next.js App Router projects.

## Live demos

- [Tone generator](https://webaudio-kit.afaqrashid.com/demos/tone)
- [Frequency sweep](https://webaudio-kit.afaqrashid.com/demos/sweep)
- [Noise burst](https://webaudio-kit.afaqrashid.com/demos/noise)
- [Audio test mode](https://webaudio-kit.afaqrashid.com/demos/test-mode)

## Run in browser

- [Vite React starter](https://stackblitz.com/fork/github/i-afaqrashid/webaudio-kit/tree/main/examples/vite-react?title=webaudio-kit%20Vite%20React%20starter) - Run in StackBlitz
- [Next App Router starter](https://stackblitz.com/fork/github/i-afaqrashid/webaudio-kit/tree/main/examples/next-app-router?title=webaudio-kit%20Next%20App%20Router%20starter) - Run in StackBlitz
- [Incident Alert Console](https://stackblitz.com/fork/github/i-afaqrashid/webaudio-kit/tree/main/examples/incident-alert-console?title=webaudio-kit%20Incident%20Alert%20Console) - Run in StackBlitz
- [Audio test mode](https://stackblitz.com/fork/github/i-afaqrashid/webaudio-kit/tree/main/examples/audio-test-mode?title=webaudio-kit%20Audio%20test%20mode) - Run in StackBlitz

Default starter: https://webaudio-kit.afaqrashid.com/new

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

## Next.js App Router

Keep controls that call hooks in a client component. The package entry includes
`"use client"`, but your component still needs a user interaction to start
browser audio:

```tsx
"use client";

import { AudioProvider, SpectrumCanvas, useTone } from "@webaudio-kit/react";

function Controls() {
  const tone = useTone({ frequency: 440, gain: 0.15 });

  return (
    <>
      <button onClick={() => void tone.play({ durationMs: 600 })}>
        Play tone
      </button>
      <SpectrumCanvas />
    </>
  );
}

export function AudioIsland() {
  return (
    <AudioProvider>
      <Controls />
    </AudioProvider>
  );
}
```

## Current Public Surface

- `@webaudio-kit/core`
  - `playTone()`
  - `playFrequencySweep()`
  - `playNoise()`
  - `dbToGain()`
  - `gainToDb()`
  - `clampFrequency()`
  - `midiToFrequency()`
  - `frequencyToMidi()`
  - `frequencyToNoteName()`
- `@webaudio-kit/react`
  - `AudioProvider`
  - `useAudioContext`
  - `useTone`
  - `useFrequencySweep`
  - `useNoise`
  - `useAudioTestMode`
  - `useVolume`
  - `useAnalyser`
  - `WaveformCanvas`
  - `SpectrumCanvas`
  - `createDefaultAudioTestModeSteps`
- `@webaudio-kit/cli`
  - `webaudio-kit agent-brief`
- `apps/demo`
  - tone generator
  - 250Hz to 8000Hz sweep
  - white, pink, and brown noise bursts
  - reusable analyser waveform and spectrum canvases
- `apps/site`
  - public landing page
  - docs overview
  - Vercel deployment config

## Local development

```sh
pnpm install
pnpm test
pnpm typecheck
pnpm build
pnpm bench
pnpm site:dev
pnpm site:build
pnpm demo:dev
pnpm demo:qa
pnpm examples:check
pnpm smoke:pack
pnpm release:check
pnpm release:check:full
pnpm release:verify-tag v1.5.1
pnpm release:notes v1.5.1
pnpm release:dry-run
pnpm verify
```

The public site runs on `http://127.0.0.1:4173`. The audio demo runs on
`http://127.0.0.1:5173`.

`pnpm demo:qa` runs the demo through Chromium, Firefox, and WebKit with
Playwright, then writes a demo screenshot, WebM, and GIF under `docs/assets/`.
`pnpm smoke:pack` packs all publishable packages and imports them from a clean
temporary app. It also runs the CLI bin from the packed tarball.

`pnpm examples:check` builds the standalone Vite React, Next App Router, plain
React, and compatibility examples from packed package tarballs so framework
integration stays honest.

`pnpm bench` runs local performance benchmarks for math helpers, playback graph
scheduling, analyser frame processing, and React audio hooks. Treat benchmark
numbers as local trend signals, not release gates. See the
[public benchmark guide](https://webaudio-kit.afaqrashid.com/docs/benchmarks)
and [Markdown benchmark guide](./docs/benchmarks.md) for telemetry-free usage
notes.

`pnpm release:check` runs the full verification gate, package smoke check, and
standalone example builds used before tagging a release.

`pnpm release:check:full` adds browser demo QA on top of the release check. Run
it before publishing when Playwright browsers and `ffmpeg` are installed.

`pnpm release:verify-tag` is the same stable-semver tag guard used by the
GitHub publish workflow. It rejects prerelease tags, package version drift,
private packages, missing public publish config, and mismatched repository
metadata.

`pnpm release:notes v1.5.1` prints the GitHub Release notes generated from
`CHANGELOG.md`, including npm links for every published package in that version.

`pnpm release:dry-run` rebuilds and smoke-tests the package tarballs, checks npm
for already-published versions, then runs `npm publish --dry-run` in the same
package order used by the tag-gated publish workflow.

## Release History

`CHANGELOG.md` is the source of truth for public release notes. Every stable
tag maps to a changelog section, a GitHub Release, and the same workspace
version across:

- `@webaudio-kit/core`
- `@webaudio-kit/react`
- `@webaudio-kit/cli`

Package READMEs link npm users back to the full changelog and GitHub Releases,
and each package tarball includes a `CHANGELOG.md` copy so the version history
travels with the package.

## Release Publishing

Publishing is triggered by stable semver tags such as `v1.0.0`. The GitHub
workflow uses Node 24, npm trusted publishing with provenance, release tag
verification, workspace verification, dependency audit, package smoke testing,
ordered package publishing, and GitHub Release creation from `CHANGELOG.md`.

Npm trusted publishing is configured for the `i-afaqrashid/webaudio-kit`
repository, `.github/workflows/publish.yml` workflow, and `npm` GitHub
environment. Token publishing is not part of the normal release path.

## Package Names

The intended npm packages are:

- `@webaudio-kit/core`
- `@webaudio-kit/react`
- `@webaudio-kit/cli`

## Safety note

Default playback gain is intentionally quiet at `0.2`. Keep volume low when
testing headphones or hearing-test-style prototypes.

This library is for building browser audio interfaces and prototypes. It is not
a certified audiology or medical testing system.

## Project docs

- [Product plan](./product-plan.md)
- [Publicity plan](./publicity-plan.md)
- [Technical docs](./docs/README.md)
- [Live demos](https://webaudio-kit.afaqrashid.com/demos)
- [Architecture](./docs/architecture.md)
- [API reference](./docs/api.md)
- [Recipes](./docs/recipes.md)
- [Browser audio guide](./docs/browser-audio.md)
- [AI agent brief CLI](./docs/agent-brief.md)
- [Examples](./docs/examples.md)
- [Example apps](./examples/README.md)
- [Run in StackBlitz](https://webaudio-kit.afaqrashid.com/new)
- [Design references](./design/README.md)
- [Deployment](./docs/deployment.md)
- [Safety](./docs/safety.md)
- [Troubleshooting](./docs/troubleshooting.md)
- [Testing](./TESTING.md)
- [Release checklist](./RELEASE.md)
- [Launch checklist](./LAUNCH.md)
- [Governance](./GOVERNANCE.md)
- [Security policy](./SECURITY.md)
- [Support](./SUPPORT.md)
- [Open source expectations](./OPEN_SOURCE.md)
- [Code of conduct](./CODE_OF_CONDUCT.md)
