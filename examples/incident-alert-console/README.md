# Incident Alert Console example

This product-style example shows how `@webaudio-kit/react` can power generated
audio cues in a monitoring dashboard without bundling audio files.

Run in StackBlitz:
https://stackblitz.com/fork/github/i-afaqrashid/webaudio-kit/tree/main/examples/incident-alert-console?title=webaudio-kit%20Incident%20Alert%20Console

It shows:

- `AudioProvider` as the shared browser audio runtime
- `useAudioContext` for an explicit enable-audio action and state display
- `useTone`, `useFrequencySweep`, and `useNoise` for severity-specific cues
- `useVolume` for a bounded master volume control
- `WaveformCanvas` and `SpectrumCanvas` for visible analyser output

## Run

```sh
pnpm install
pnpm examples:check
cd examples/incident-alert-console
pnpm install
pnpm dev
```

The example depends on the published package range for
`@webaudio-kit/react`. The repository-level `pnpm examples:check` command
replaces that dependency with freshly packed local tarballs in a temporary app
and verifies the example builds.
