# webaudio-kit Docs

This folder contains technical documentation for using, maintaining, and
shipping `webaudio-kit`.

## Start Here

- [Quick start](./quick-start.md)
- [API reference](./api.md)
- [Architecture](./architecture.md)
- [Browser audio guide](./browser-audio.md)
- [Examples](./examples.md)
- [Apps](./apps.md)
- [Example apps](../examples/README.md)
- [Design references](../design/README.md)
- [Safety](./safety.md)
- [Troubleshooting](./troubleshooting.md)
- [Deployment](./deployment.md)
- [Performance](./performance.md)

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
- `useVolume`
- `useAnalyser`
- `playTone`
- `playFrequencySweep`
- `dbToGain`
- `gainToDb`
- `clampFrequency`

Microphone support, AudioWorklets, and visualizer packages are future work.
