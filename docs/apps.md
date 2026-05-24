# Apps

## `apps/site`

`apps/site` is the public web surface. It exists for:

- install and quick-start copy
- package positioning
- hosted documentation overview
- public demo proof and non-goals
- Vercel deployment

Run it locally:

```sh
pnpm site:dev
```

Build it:

```sh
pnpm site:build
```

The local site runs on `http://127.0.0.1:4173`.

Keep this app useful for readers who have not cloned the repo yet. The site can
show code, the interactive demo, and release status, but deeper browser
playback testing belongs in `apps/demo`.

## `apps/demo`

`apps/demo` is the current runnable frontend. It exists for:

- manual audio QA
- browser autoplay checks
- visual proof through the analyser canvas
- deployment as the public demo
- quick product screenshots and GIFs

Run it locally:

```sh
pnpm demo:dev
```

Build it:

```sh
pnpm demo:build
```

Run automated browser demo QA:

```sh
pnpm demo:qa
```

The demo should stay focused on the public API:

- tone generator
- gain control
- waveform type
- pan
- frequency sweep
- analyser waveform
- safety disclaimer

Do not turn `apps/demo` into a full documentation site. It should stay small
enough to manually inspect before release.

## Public Site Deployment

The current public site target is:

```txt
webaudio-kit.afaqrashid.com
```

See [deployment](./deployment.md).

## Example Apps

Standalone examples live under `examples/`. They are intentionally outside the
workspace build so they stay copy-pasteable and do not slow package release
checks.

Current examples:

- `examples/vite-tone-panel`
- `examples/next-provider-example`
- `examples/audio-test-mode`

Each example should include:

- short README
- local run command
- browser support notes
- non-medical disclaimer when hearing-test-style UI is present
