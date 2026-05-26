# @webaudio-kit/react

React primitives for browser audio apps.

## Install

```sh
npm install @webaudio-kit/core @webaudio-kit/react
pnpm add @webaudio-kit/core @webaudio-kit/react
yarn add @webaudio-kit/core @webaudio-kit/react
```

`@webaudio-kit/core` is a peer dependency of `@webaudio-kit/react`. Install both
packages together so React hooks and any direct core imports share one explicit
core version in your app.

## Framework Install Snippets

### Vite React

```sh
pnpm create vite my-audio-app --template react-ts
cd my-audio-app
pnpm add @webaudio-kit/core @webaudio-kit/react
```

### Next App Router

Install in the app root, then keep audio controls inside a client component.

```sh
pnpm add @webaudio-kit/core @webaudio-kit/react
```

```tsx
"use client";

import { AudioProvider, useTone } from "@webaudio-kit/react";

export function AudioControls() {
  return (
    <AudioProvider>
      <ToneButton />
    </AudioProvider>
  );
}
```

### Plain React

```tsx
import { createRoot } from "react-dom/client";
import { AudioProvider } from "@webaudio-kit/react";

createRoot(document.getElementById("root")!).render(
  <AudioProvider>
    <App />
  </AudioProvider>,
);
```

## Example

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
  const tone = useTone({ frequency: 440, gain: 0.2 });

  return (
    <button onClick={() => void tone.play()}>
      {tone.isPlaying ? "Restart" : "Play"}
    </button>
  );
}
```

Noise bursts use the same provider graph:

```tsx
const noise = useNoise({ type: "pink", durationMs: 800, gain: 0.08 });

<button onClick={() => void noise.play()}>Play pink noise</button>;
```

Patterned cues can be supplied per play call, so alert profiles do not need
construction-time placeholder hook options:

```tsx
const alertTone = useTone();

<button
  onClick={() =>
    void alertTone.play({
      frequency: 880,
      durationMs: 120,
      gain: 0.12,
      type: "square",
      envelope: { attackMs: 8, releaseMs: 45 },
      pattern: { repeat: 3, gapMs: 90 },
    })
  }
>
  Play alert
</button>;
```

Envelope options are available on tone, sweep, and noise hooks:

```tsx
const sweep = useFrequencySweep({
  from: 440,
  to: 880,
  durationMs: 500,
  gain: 0.12,
  envelope: { attackMs: 10, decayMs: 40, sustain: 0.7, releaseMs: 80 },
});
```

Filters and voices are useful for alert cue styling:

```tsx
const warningTone = useTone({
  frequency: 660,
  durationMs: 220,
  gain: 0.15,
  type: "sawtooth",
  envelope: { attackMs: 8, releaseMs: 55 },
  filter: { frequency: 1800, q: 0.7 },
  voices: { count: 2, spreadCents: 10 },
});
```

Provider-level stop controls are available through `useAudioContext()`:

```tsx
import { useAudioContext, useVolume } from "@webaudio-kit/react";

function AlertControls() {
  const audio = useAudioContext();
  const volume = useVolume();

  return (
    <>
      <button onClick={() => audio.stopAll()}>Stop all cues</button>
      <button onClick={() => void volume.setGain(0)}>Mute output</button>
    </>
  );
}
```

`stopAll()` cancels active and scheduled React hook playback handles. Muting with
`useVolume().setGain(0)` changes master output level, but it does not cancel
already scheduled tones, sweeps, noise bursts, patterns, or test-mode steps.

## API

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
- re-exported helpers from `@webaudio-kit/core`

## Responsive Visualizers

`width` and `height` set the canvas backing buffer that analyser data is drawn
into. Use `style`, `className`, or other forwarded canvas attributes for CSS
layout when the panel needs to stretch with its container.

```tsx
import { SpectrumCanvas, WaveformCanvas } from "@webaudio-kit/react";

function AnalyserPanel() {
  return (
    <>
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
    </>
  );
}
```

Useful props:

- `WaveformCanvas`: `strokeColor`, `idleStrokeColor`, `backgroundColor`,
  `lineWidth`, plus standard canvas props such as `className` and `style`.
- `SpectrumCanvas`: `barColor`, `idleBarColor`, `backgroundColor`, `barCount`,
  `barGap`, `minBarHeight`, plus standard canvas props such as `className` and
  `style`.

## Docs And Examples

- API reference: https://webaudio-kit.afaqrashid.com/docs/api
- Recipes: https://webaudio-kit.afaqrashid.com/docs/recipes
- Example apps: https://webaudio-kit.afaqrashid.com/docs/examples
- Markdown docs: https://github.com/i-afaqrashid/webaudio-kit/tree/main/docs
- LLM docs index: https://webaudio-kit.afaqrashid.com/llms.txt
- Interactive demos: https://webaudio-kit.afaqrashid.com/demos

## Release History

Every npm version maps to a GitHub tag and a `CHANGELOG.md` section.

- Changelog: https://webaudio-kit.afaqrashid.com/changelog
- GitHub Releases: https://github.com/i-afaqrashid/webaudio-kit/releases
- npm versions: https://www.npmjs.com/package/@webaudio-kit/react?activeTab=versions

The published npm tarball includes `CHANGELOG.md` so version history is
available with the package contents.

`AudioProvider` lazily creates and resumes `AudioContext` when playback starts.
This matches browser autoplay rules and keeps import-time behavior safe.

This library is for browser audio interfaces and prototypes. It is not a
certified audiology or medical testing system.
