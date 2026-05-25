# Vite tone panel

Small Vite + React example for the most common webaudio-kit setup.

## What it shows

- `AudioProvider` around interactive controls
- `useTone` with frequency and gain controls
- `useFrequencySweep` for a bounded 250Hz to 8000Hz sweep
- `useNoise` for a short pink-noise burst
- `WaveformCanvas` and `SpectrumCanvas` connected to the provider analyser

## Run

```sh
pnpm install
pnpm build
pnpm --filter webaudio-kit-vite-tone-panel dev
```

Open the printed local URL and start playback from a button click.
