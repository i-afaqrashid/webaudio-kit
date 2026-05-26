# Performance

## What Matters

For the current library surface, performance risk is mostly in:

- creating many short-lived oscillator graphs
- scheduling frequent sweeps
- analyser frame processing
- React state churn around playback controls
- canvas drawing work in demos

The library should keep the core playback path small and allocate only the Web
Audio nodes needed for each playback call.

## Local Checks

Run the normal gate first:

```sh
pnpm verify
```

For audio and animation changes, also run:

```sh
pnpm demo:qa
```

If your branch includes the benchmark suite, run:

```sh
pnpm bench
```

Benchmark numbers vary by machine and current system load. Use them as local
comparison signals, not hard release thresholds. See the
[Benchmark guide](./benchmarks.md) for telemetry-free benchmark usage,
interpretation notes, and limitations across browsers and devices.

## Manual Profiling

For demo or visualizer work:

- record a browser Performance profile while playing a tone
- record another while running a sweep
- inspect animation frame time
- inspect memory growth after repeated play/stop cycles
- confirm stopped playback disconnects nodes

## React Guidance

Avoid re-rendering the full app on every analyser frame. Analyser drawing should
usually happen inside a canvas effect, not through React state for every sample.

Good:

```tsx
requestAnimationFrame(draw);
analyser.getByteTimeDomainData(data);
```

Avoid:

```tsx
setSamples([...data]);
```

on every animation frame unless the UI is intentionally small.

## Web Audio Guidance

Oscillator nodes are one-shot. Creating one oscillator per play call is normal.
Trying to reuse stopped oscillators is incorrect.

Keep cleanup idempotent because stop paths can run from:

- user stop button
- scheduled duration
- oscillator `onended`
- component unmount

## Regression Notes

When changing performance-sensitive code, include in the PR:

- scenario tested
- before/after observation
- browser used
- whether system audio output was active
- any benchmark result if available
