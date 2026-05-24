# Examples

The examples are intentionally small copy-paste references. They are not part of
the pnpm workspace release build because the published packages should stay the
source of truth.

## Vite tone panel

`examples/vite-tone-panel` shows the standard client-side setup:

- wrap controls in `AudioProvider`
- play and stop a tone with `useTone`
- run a frequency sweep with `useFrequencySweep`
- render a small analyser canvas with `useAnalyser`

## Next provider example

`examples/next-provider-example` shows the important Next.js boundary: the file
that imports hooks from `@webaudio-kit/react` must be a client component.

## Running an example

Install the packages in this repository first:

```bash
pnpm install --frozen-lockfile
pnpm build
```

Then copy an example into an app or install the packages from npm after the first
public publish.
