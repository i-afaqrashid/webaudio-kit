# Vite React example

This is the main Vite + React copy-paste example for `@webaudio-kit/react`.

It shows:

- `AudioProvider` around interactive controls
- `useTone` with frequency and dB-based gain controls
- `useFrequencySweep` for a bounded sweep
- `useNoise` for a short pink-noise burst
- `useVolume` for shared master gain
- `WaveformCanvas` and `SpectrumCanvas` connected to the provider analyser

## Run in StackBlitz

https://stackblitz.com/fork/github/i-afaqrashid/webaudio-kit/tree/main/examples/vite-react?title=webaudio-kit%20Vite%20React%20starter

## Run

```sh
pnpm install
pnpm examples:check
cd examples/vite-react
pnpm install
pnpm dev
```

The example depends on the published package range for
`@webaudio-kit/react`. The repository-level `pnpm examples:check` command
replaces that dependency with freshly packed local tarballs in a temporary app
and verifies the example builds.
