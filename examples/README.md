# Examples

The examples are intentionally small copy-paste references. They are not part of
the pnpm workspace release build because the published packages should stay the
source of truth.

## Vite tone panel

`examples/vite-tone-panel` shows the standard client-side setup:

- wrap controls in `AudioProvider`
- play and stop a tone with `useTone`
- run a frequency sweep with `useFrequencySweep`
- play a short pink-noise burst with `useNoise`
- render waveform and spectrum canvases with `WaveformCanvas` and
  `SpectrumCanvas`

## Next provider example

`examples/next-provider-example` shows the important Next.js boundary: the file
that imports hooks from `@webaudio-kit/react` must be a client component.

It also proves that `useNoise`, `WaveformCanvas`, and `SpectrumCanvas` work
from a Next App Router client component while the page itself remains a server
component.

## Running an example

Install the packages in this repository first:

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm examples:check
```

`pnpm examples:check` installs packed package tarballs into clean temporary Vite
and Next apps, then builds both examples.
