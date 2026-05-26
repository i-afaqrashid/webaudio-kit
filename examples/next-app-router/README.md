# Next App Router example

This example shows the important Next.js boundary for `@webaudio-kit/react`:
server components can render the page shell, but `AudioProvider`, hooks, and
browser playback controls must live in a `"use client"` component.

It shows:

- App Router `app/page.tsx` as a server component
- `app/audio-controls.tsx` as the client component
- tone, sweep, noise, volume, waveform, and spectrum controls
- playback started from button clicks

## Run

```sh
pnpm install
pnpm examples:check
cd examples/next-app-router
pnpm install
pnpm dev
```

The repository-level `pnpm examples:check` command packs local packages and
installs those tarballs into this example in a temporary folder before running
the example build.
