# Apps

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

## Public Demo Deployment

The current public demo target is:

```txt
webaudio-kit.afaqrashid.com
```

See [deployment](./deployment.md).

## Future `apps/docs`

A dedicated docs app can be added later when the Markdown docs need live demos,
routing, search, and richer API pages.

Suggested routes:

- `/`
- `/quick-start`
- `/api`
- `/tone-generator`
- `/frequency-sweep`
- `/waveform`
- `/metronome`
- `/hearing-test-style-prototype`
- `/safety`

If `apps/docs` is added, keep it client-heavy and avoid server-only assumptions
around Web Audio.

## Example Apps

Future standalone examples can live under `examples/` or `apps/` once they are
large enough to justify separate package manifests.

Good candidates:

- `examples/tone-generator`
- `examples/frequency-sweep`
- `examples/metronome`
- `examples/waveform`
- `examples/hearing-style-prototype`

Each example should include:

- short README
- local run command
- browser support notes
- non-medical disclaimer when hearing-test-style UI is present
