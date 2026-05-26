# Plain React example

This is the smallest standalone React example for `@webaudio-kit/react`. It
uses Vite only as a local dev server and bundler; the app itself is plain React.

It shows:

- `AudioProvider` at the app boundary
- `useTone` from a click handler
- `useVolume` for master gain
- waveform and spectrum canvases with default styling

## Run

```sh
pnpm install
pnpm examples:check
cd examples/plain-react
pnpm install
pnpm dev
```

The repository-level `pnpm examples:check` command verifies this example against
freshly packed local tarballs while the manifest keeps a normal published range
for `@webaudio-kit/react`.
