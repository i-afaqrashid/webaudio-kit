# @webaudio-kit/react

React primitives for browser audio apps.

## Install

```sh
pnpm add @webaudio-kit/core @webaudio-kit/react
```

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

## Visualizers

```tsx
import { SpectrumCanvas, WaveformCanvas } from "@webaudio-kit/react";

function AnalyserPanel() {
  return (
    <>
      <WaveformCanvas
        backgroundColor="#10110f"
        height={180}
        strokeColor="#c8ea3a"
        width={720}
      />
      <SpectrumCanvas
        backgroundColor="#10110f"
        barColor="#8ed8ff"
        height={140}
        width={720}
      />
    </>
  );
}
```

## Docs And Examples

- API reference: https://webaudio-kit.afaqrashid.com/docs/api
- Recipes: https://webaudio-kit.afaqrashid.com/docs/recipes
- Example apps: https://webaudio-kit.afaqrashid.com/docs/examples
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
