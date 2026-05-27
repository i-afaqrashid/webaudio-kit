# webaudio-kit

React and TypeScript primitives for serious browser audio apps.

> Build browser audio interfaces in React without fighting AudioContext.

`webaudio-kit` is a small browser audio toolkit for React apps that need tone
generation, frequency sweeps, noise bursts, volume controls, stereo panning,
pitch helpers, and analyser data without hand-managing raw Web Audio node
lifecycles.

It is intentionally scoped to safe procedural UI audio. If you need a full synth
engine, transport, effects chain, AudioWorklets, or deep custom routing, read the
[scope and limitations guide](./docs/scope-and-limitations.md) before choosing
the package.

![webaudio-kit demo](./docs/assets/demo.gif)

## Install

```sh
npm install @webaudio-kit/core @webaudio-kit/react
pnpm add @webaudio-kit/core @webaudio-kit/react
yarn add @webaudio-kit/core @webaudio-kit/react
```

## Quick React Example

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
  const tone = useTone({ frequency: 440, gain: 0.12, durationMs: 500 });

  return <button onClick={() => void tone.play()}>Play 440Hz</button>;
}
```

Optional CLI helper:

```sh
npx @webaudio-kit/cli@latest agent-brief
pnpm dlx @webaudio-kit/cli agent-brief
yarn dlx @webaudio-kit/cli@latest agent-brief
```

The packages target browser runtimes and Node `>=20.19` for local tooling.
`@webaudio-kit/react` supports React `>=18.3`, ships as a client entry for
Next.js App Router projects, and declares `@webaudio-kit/core` as a peer
dependency so apps keep one explicit core version.

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

## Try It Without A Build

For CodePen, JSFiddle, or a single static HTML page, load the core
package directly through `esm.sh` — no bundler required. Audio still
needs a user gesture to start playback:

```html
<!doctype html>
<button id="play">Play 440Hz</button>
<script type="module">
  import { playTone } from "https://esm.sh/@webaudio-kit/core";

  const audioContext = new AudioContext();
  document.getElementById("play").addEventListener("click", async () => {
    await audioContext.resume();
    playTone(audioContext, { frequency: 440, durationMs: 500, gain: 0.12 });
  });
</script>
```

The React package can be loaded the same way through
`https://esm.sh/@webaudio-kit/react` when used inside a CDN-style React
runtime such as `https://esm.sh/react`.

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

## Enable Audio button

Use `useAudioUnlock()` when a product needs an explicit first-run control before
alert sounds or background UI cues feel reliable. The hook calls the provider
from the button click and exposes labels for `idle`, `unlocking`, `suspended`,
`running`, and failed unlock states.

```tsx
import { useAudioUnlock } from "@webaudio-kit/react";

function EnableAudioButton() {
  const audio = useAudioUnlock();

  return (
    <>
      <button disabled={audio.isUnlocked} onClick={() => void audio.unlock()}>
        {audio.isUnlocked ? "Audio enabled" : "Enable Audio"}
      </button>
      <span>{audio.status}</span>
      {audio.error ? <span>unlock failed</span> : null}
    </>
  );
}
```

## Alert cue pattern

Use `pattern` when a UI needs repeated cues such as beep-beep-beep alerts. The
handle controls the full scheduled pattern, including future voices.

```tsx
const alertTone = useTone();

await alertTone.play({
  frequency: 880,
  durationMs: 120,
  gain: 0.12,
  type: "square",
  pattern: { repeat: 3, gapMs: 90 },
});

alertTone.stop();
```

Add a short envelope when the cue should fade in or out instead of gating
abruptly:

```tsx
await alertTone.play({
  frequency: 880,
  durationMs: 180,
  gain: 0.12,
  envelope: { attackMs: 8, releaseMs: 45 },
});
```

Shape harsher cues with a lowpass filter and lightweight detuned voices:

```tsx
await alertTone.play({
  frequency: 660,
  durationMs: 220,
  gain: 0.15,
  type: "sawtooth",
  envelope: { attackMs: 8, releaseMs: 55 },
  filter: { frequency: 1800, q: 0.7 },
  voices: { count: 2, spreadCents: 10 },
});
```

## Stop all playback

Use `useAudioContext().stopAll()` for panic buttons, alert acknowledge actions,
or route changes that must cancel already scheduled library playback. This is
different from setting master gain to `0`: muting affects volume, while
`stopAll()` stops active tone, sweep, noise, repeated pattern, and test-mode
handles created through the React provider.

```tsx
import { useAudioContext, useVolume } from "@webaudio-kit/react";

function AlertControls() {
  const audio = useAudioContext();
  const volume = useVolume();

  return (
    <>
      <button onClick={() => audio.stopAll()}>Stop all cues</button>
      <button onClick={() => void volume.setGain(0)}>Mute future output</button>
    </>
  );
}
```

## Controlled Volume Slider

Use `useVolumeControl()` when a slider should read and write provider gain
directly. This avoids duplicate app state for volume controls, keeps safe bounds
in one place, and can persist a preference with `storageKey`.

```tsx
import { useVolumeControl } from "@webaudio-kit/react";

function ControlledVolumeSlider() {
  const volume = useVolumeControl({
    maxGain: 0.5,
    storageKey: "app-master-gain",
  });

  return (
    <>
      <input {...volume.inputProps} />
      <span>{volume.gain.toFixed(2)}</span>
      <button onClick={() => void volume.resetGain()}>Reset volume</button>
    </>
  );
}
```

Keep app-level state only for product preferences outside audio output, such as
whether a workspace is muted by policy. For normal master volume UI, provider
gain should be the source of truth.

## Provider-scoped playback

Use `useAudioEngine()` when a React screen needs custom or layered sounds but
should still route through `AudioProvider` master gain and analyser output. The
engine creates/resumes audio from the user action, returns stop handles, and
registers playback with provider `stopAll()`.

```tsx
import { useAudioEngine } from "@webaudio-kit/react";

function LayeredAlertButton() {
  const engine = useAudioEngine();

  async function playLayeredAlert() {
    await engine.playTone({
      frequency: 880,
      durationMs: 160,
      gain: 0.1,
      type: "square",
    });
    await engine.playNoise({
      durationMs: 120,
      gain: 0.025,
      type: "pink",
    });
  }

  return (
    <>
      <button onClick={() => void playLayeredAlert()}>
        Play layered alert
      </button>
      <button onClick={() => engine.stopAll()}>Stop all</button>
    </>
  );
}
```

Use `engine.withAudioRuntime()` when custom Web Audio code needs the non-null
provider runtime and should connect through `runtime.masterGain`.

## Responsive Visualizers

`WaveformCanvas` and `SpectrumCanvas` forward standard canvas attributes, so
you can keep the drawing backing buffer stable with `width`/`height` while using
CSS `style` for responsive layout. The backing buffer controls analyser drawing
resolution; CSS sizing controls how the canvas fits its container.

```tsx
import { SpectrumCanvas, WaveformCanvas } from "@webaudio-kit/react";

function SignalPanel() {
  return (
    <div style={{ maxWidth: 720 }}>
      <WaveformCanvas
        backgroundColor="#10110f"
        height={180}
        idleStrokeColor="#394135"
        lineWidth={2}
        strokeColor="#c8ea3a"
        style={{ width: "100%", height: 140 }}
        width={720}
      />
      <SpectrumCanvas
        backgroundColor="#10110f"
        barColor="#8ed8ff"
        barCount={48}
        barGap={2}
        height={140}
        idleBarColor="#394135"
        minBarHeight={2}
        style={{ width: "100%", height: 120 }}
        width={720}
      />
    </div>
  );
}
```

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
  - `useAudioUnlock`
  - `useAudioEngine`
  - `useTone`
  - `useFrequencySweep`
  - `useNoise`
  - `useAudioTestMode`
  - `useVolume`
  - `useVolumeControl`
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
- [Hooks vs Core](./docs/hooks-vs-core.md)
- [Scope and limitations](./docs/scope-and-limitations.md)
- [Markdown docs fallback](https://github.com/i-afaqrashid/webaudio-kit/tree/main/docs)
- [LLM docs index](https://webaudio-kit.afaqrashid.com/llms.txt)
- [Live demos](https://webaudio-kit.afaqrashid.com/demos)
- [Architecture](./docs/architecture.md)
- [API reference](./docs/api.md)
- [Recipes](./docs/recipes.md)
- [Browser audio guide](./docs/browser-audio.md)
- [Docs fetch access](./docs/fetch-access.md)
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
