# webaudio-kit Docs

This folder contains technical documentation for using, maintaining, and
shipping `webaudio-kit`.

## Start Here

- [Quick start](./quick-start.md)
- [Live demos](https://webaudio-kit.afaqrashid.com/demos)
- [API reference](./api.md)
- [Recipes](./recipes.md)
- [Architecture](./architecture.md)
- [Browser audio guide](./browser-audio.md)
- [Docs fetch access](./fetch-access.md)
- [AI agent brief CLI](./agent-brief.md)
- [Examples](./examples.md)
- [Apps](./apps.md)
- [Example apps](../examples/README.md)
- [Design references](../design/README.md)
- [Safety](./safety.md)
- [Troubleshooting](./troubleshooting.md)
- [Deployment](./deployment.md)
- [Performance](./performance.md)
- [Benchmarks](./benchmarks.md)

## Repository Docs

Root-level docs cover project operations:

- [Testing](../TESTING.md)
- [Release checklist](../RELEASE.md)
- [Launch checklist](../LAUNCH.md)
- [Governance](../GOVERNANCE.md)
- [Open source expectations](../OPEN_SOURCE.md)
- [Security policy](../SECURITY.md)
- [Support](../SUPPORT.md)
- [Contributing](../CONTRIBUTING.md)

## Scope

The current public surface is intentionally small:

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

The React package entry preserves `"use client"` for Next.js App Router
projects. Keep hook usage in client components and trigger playback from click,
tap, or keyboard handlers.

- `playTone`
- `playFrequencySweep`
- `playNoise`
- `dbToGain`
- `gainToDb`
- `clampFrequency`
- `midiToFrequency`
- `frequencyToMidi`
- `frequencyToNoteName`
- `webaudio-kit agent-brief`

Microphone support, AudioWorklets, and larger visualizer packages are future
work.
