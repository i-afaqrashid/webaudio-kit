# Benchmarks

`webaudio-kit` benchmarks are local developer tools. They are for comparing
changes on your machine, not for collecting usage data or publishing universal
performance claims.

## Run

```sh
pnpm bench
```

The command runs Vitest benchmark files from the repo:

- `benchmarks/core-math.bench.ts`
- `benchmarks/core-playback.bench.ts`
- `benchmarks/analyser-frame.bench.ts`
- `benchmarks/react-hooks.bench.tsx`

## What The Suite Measures

- Math helper throughput for dB/gain conversion, frequency clamping, and note
  labels.
- Core playback graph setup for tones, sweeps, noise buffers, pan, gain, stop
  cleanup, and mixed scheduling.
- Analyser frame reads and waveform coordinate calculations.
- React provider and hook overhead with a fake `AudioContext`.

## How To Read Local Numbers

Benchmark numbers are local trend signals. Use them to compare one branch
against another on the same machine, with the same Node version, package
manager, and system load.

Good benchmark notes include:

- machine and operating system
- Node and pnpm versions
- command used
- benchmark files touched
- before and after numbers from the same machine
- whether the change affects core math, playback scheduling, analyser work, or
  React hooks

## Limits

These numbers are not release gates. Timing varies across browsers, devices,
CPU power modes, thermal state, background apps, and CI runners.

The benchmark suite uses fake Web Audio nodes for repeatability. It can catch
local regressions in JavaScript work, but it does not measure real speakers,
sound hardware, browser audio output latency, or medical/audiology equipment.

## No Telemetry

No telemetry is added by the benchmark suite.

No analytics are collected by `pnpm bench`.

No tracking, network upload, browser fingerprinting, or user measurement is part
of these benchmarks.

If a future benchmark needs to write output, keep it local to the repository or
a user-specified file path. Do not phone home.
