# @webaudio-kit/react

React primitives for browser audio apps.

## Install

```sh
pnpm add @webaudio-kit/core @webaudio-kit/react
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
