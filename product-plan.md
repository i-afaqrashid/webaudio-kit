# webaudio-kit Product Plan

Source notes: `../1.md`

## Positioning

webaudio-kit is more technical and niche than cms-lab.

It should help React developers build browser audio apps without managing raw Web Audio API complexity directly.

## Who It Is For

- React developers
- Audio tool builders
- Music app builders
- Hearing test app builders
- Medtech prototypes
- Language learning apps
- Sound visualization apps
- Browser-based synth builders

## What It Helps With

- Tone generation
- Frequency sweeps
- Audio calibration
- Decibel-ish volume controls
- Stereo panning
- Microphone input later
- Waveform visualization
- Oscillators
- Audio analysis
- Playback state
- Low-latency AudioWorklet nodes later

## Core API

The first version should feel like this:

```tsx
import { AudioProvider, useTone } from "@webaudio-kit/react";

function App() {
  return (
    <AudioProvider>
      <ToneDemo />
    </AudioProvider>
  )
}

function ToneDemo() {
  const tone = useTone({
    frequency: 440,
    gain: 0.2,
  });

  return <button onClick={() => tone.play()}>Play 440Hz</button>;
}
```

## Tech Stack

- Language: TypeScript
- Runtime: Browser + Node for build tooling
- Framework support: React first
- Bundler: tsup
- Docs/demo: Vite + React
- Testing: Vitest
- Browser tests: Playwright later
- Audio testing: unit tests for math/helpers, manual demos for actual sound
- Package manager: pnpm
- Linting: ESLint
- Formatting: Prettier
- Publishing: npm

Optional later:

- Storybook
- WebAssembly
- AudioWorklet processors
- React Native Web maybe not
- Svelte/Vue adapters later

## Suggested Repo Structure

```txt
webaudio-kit/
  packages/
    core/
    react/
    worklets/
    visualizers/
  examples/
    tone-generator/
    hearing-test/
    metronome/
    waveform/
    frequency-sweep/
  docs/
  package.json
  pnpm-workspace.yaml
```

## Packages

`@webaudio-kit/core`

- No React
- Pure browser audio utilities
- `dbToGain()`
- `gainToDb()`
- `clampFrequency()`
- `playTone()`
- `playFrequencySweep()`

`@webaudio-kit/react`

- `AudioProvider`
- `useAudioContext`
- `useTone`
- `useFrequencySweep`
- `useMicrophone`
- `useAnalyser`
- `useVolume`
- `useStereoPanner`
- `useAudioPermissions`

`@webaudio-kit/worklets`

- Reserve this package name, but do not build it first
- Later: noise generator, meter processor, peak detector, custom analyzer, low-latency helpers

`@webaudio-kit/visualizers`

- `Waveform`
- `Spectrum`
- `VolumeMeter`
- `FrequencyBars`
- `Oscilloscope`

## MVP

Version 0.1 should include only:

- `AudioProvider`
- `useAudioContext`
- `useTone`
- `useVolume`
- `useFrequencySweep`
- `useAnalyser`
- Basic Vite demo
- Great README

Do not start with worklets. Do not start with microphone. Browser permission handling will slow the project down.

## Killer Demos

- Tone Generator
- Frequency Sweep
- Hearing Test Prototype
- Metronome
- Waveform Visualizer

The hearing test prototype demo is likely the strongest because it connects to the Hearingly experience.

Example demo UI:

```txt
Frequency: 1000 Hz
Volume: -20 dB
Ear: Left / Right / Both
Play tone
I heard it
I did not hear it
```

## Important Warning

Do not claim medical accuracy.

Use this language:

> This library is for building browser audio interfaces and prototypes. It is not a certified audiology or medical testing system.

## First Commit Direction

Start with:

```tsx
<AudioProvider>
  <ToneButton frequency={440} />
</AudioProvider>
```

Then add frequency sweep.
