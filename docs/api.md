# API Reference

## `@webaudio-kit/core`

### `ToneOptions`

```ts
type ToneOptions = {
  frequency: number;
  gain?: number;
  type?: OscillatorType;
  pan?: number;
  durationMs?: number;
  detuneCents?: number;
  envelope?: PlaybackEnvelope;
  filter?: PlaybackFilter;
  pattern?: PlaybackPattern;
  voices?: PlaybackVoices;
};
```

- `frequency`: tone frequency in Hz. Values are clamped to the playable range.
- `gain`: linear gain. Defaults to `0.2`.
- `type`: oscillator waveform. Defaults to `"sine"`.
- `pan`: stereo pan from `-1` left to `1` right. Defaults to `0`.
- `durationMs`: optional playback duration. If omitted, playback continues
  until stopped.
- `detuneCents`: oscillator detune in cents. Defaults to `0`.
- `envelope`: optional gain envelope for attack, decay, sustain, and release.
- `filter`: optional BiquadFilterNode routing. Defaults to lowpass when set.
- `pattern`: optional repeat pattern. Repeated tones require `durationMs`.
- `voices`: optional bounded multi-voice layering. Requested gain is divided
  across voices.

### `PlaybackFilter`

```ts
type PlaybackFilter = {
  frequency: number;
  q?: number;
  type?: BiquadFilterType;
};
```

- `frequency`: positive filter frequency in Hz, clamped to `20..20000`.
- `q`: non-negative Q value. Defaults to `1`.
- `type`: browser biquad filter type. Defaults to `"lowpass"`.

### `PlaybackVoices`

```ts
type PlaybackVoices = {
  count?: number;
  spreadCents?: number;
};
```

- `count`: integer voice count from `1..8`. Defaults to `1`.
- `spreadCents`: total detune spread across voices. Defaults to `0`.

### `PlaybackEnvelope`

```ts
type PlaybackEnvelope = {
  attackMs?: number;
  decayMs?: number;
  sustain?: number;
  releaseMs?: number;
};
```

- `attackMs`: fade-in duration in milliseconds. Defaults to `0`.
- `decayMs`: time to ramp from peak gain to sustain gain. Defaults to `0`.
- `sustain`: `0..1` multiplier of the requested gain. Defaults to `1`.
- `releaseMs`: fade-out duration in milliseconds. Defaults to `0`.

### `PlaybackPattern`

```ts
type PlaybackPattern = {
  repeat?: number;
  gapMs?: number;
};
```

- `repeat`: total number of plays. Defaults to `1` and must be a positive
  integer.
- `gapMs`: silence between plays. Defaults to `0` and must be non-negative.

### `FrequencySweepOptions`

```ts
type FrequencySweepOptions = {
  from: number;
  to: number;
  durationMs: number;
  gain?: number;
  type?: OscillatorType;
  pan?: number;
  detuneCents?: number;
  envelope?: PlaybackEnvelope;
  filter?: PlaybackFilter;
  pattern?: PlaybackPattern;
  voices?: PlaybackVoices;
};
```

`durationMs` is required for sweeps and must be a positive finite number.
`pattern` schedules repeated sweeps with the same duration and gap.

### `NoiseOptions`

```ts
type NoiseType = "white" | "pink" | "brown";

type NoiseOptions = {
  durationMs: number;
  gain?: number;
  pan?: number;
  type?: NoiseType;
  envelope?: PlaybackEnvelope;
  filter?: PlaybackFilter;
  pattern?: PlaybackPattern;
};
```

`durationMs` is required for noise playback and must be a positive finite
number. Noise is generated into a short mono buffer per play call, then routed
through the same gain and optional stereo panner graph as tones and sweeps.
`pattern` schedules multiple short buffers without consumer-owned timers.

### `PlaybackHandle`

```ts
type PlaybackHandle = {
  stop(): void;
};
```

The stop method is safe to call more than once.

### `playTone(context, options, destination?)`

Creates a fresh oscillator, gain node, and stereo panner per call. The node graph
connects into `destination`, or `context.destination` if no destination is
provided.

```ts
const handle = playTone(audioContext, {
  frequency: 440,
  gain: 0.2,
  type: "sine",
});

handle.stop();
```

Repeated alert cue:

```ts
const handle = playTone(audioContext, {
  frequency: 880,
  durationMs: 120,
  gain: 0.12,
  type: "square",
  envelope: { attackMs: 8, releaseMs: 45 },
  filter: { frequency: 1800, q: 0.7 },
  pattern: { repeat: 3, gapMs: 90 },
  voices: { count: 2, spreadCents: 10 },
});

handle.stop();
```

### `playFrequencySweep(context, options, destination?)`

Creates a fresh oscillator graph and schedules a linear frequency ramp from
`from` to `to`.

```ts
playFrequencySweep(audioContext, {
  from: 250,
  to: 8000,
  durationMs: 2400,
  gain: 0.1,
});
```

### `playNoise(context, options, destination?)`

Creates a fresh `AudioBufferSourceNode`, fills a mono noise buffer, and routes it
through gain and stereo pan nodes.

```ts
playNoise(audioContext, {
  type: "pink",
  durationMs: 800,
  gain: 0.08,
});
```

Supported noise types are `white`, `pink`, and `brown`.

### `dbToGain(db)`

```ts
dbToGain(-6); // 0.501...
```

Uses:

```ts
10 ** (db / 20);
```

### `gainToDb(gain)`

```ts
gainToDb(0.5); // -6.020...
```

Zero, negative, and non-finite gains return `Number.NEGATIVE_INFINITY`.

### `clampFrequency(value, min?, max?)`

```ts
clampFrequency(5); // 20
clampFrequency(440); // 440
clampFrequency(30000); // 20000
```

Defaults to `20..20000` Hz.

### `midiToFrequency(midiNote, concertA?)`

```ts
midiToFrequency(69); // 440
midiToFrequency(60); // 261.625...
```

`concertA` defaults to `440`.

### `frequencyToMidi(frequency, concertA?)`

```ts
frequencyToMidi(440); // 69
```

Returns `Number.NaN` for zero, negative, or non-finite frequencies.

### `frequencyToNoteName(frequency, options?)`

```ts
frequencyToNoteName(440); // "A4"
frequencyToNoteName(445, { includeCents: true }); // "A4 +20c"
```

Returns `"unknown"` for invalid frequencies.

## `@webaudio-kit/react`

### `AudioProvider`

```tsx
<AudioProvider initialGain={0.2}>
  <App />
</AudioProvider>
```

Creates the provider graph lazily:

```txt
tone/sweep/noise -> masterGain -> analyser -> destination
```

### `useAudioContext()`

Returns the provider state and controls:

```ts
{
  audioContext: AudioContext | null;
  masterGain: GainNode | null;
  analyser: AnalyserNode | null;
  state: AudioContextState | "idle";
  gain: number;
  ensureAudioContext(): Promise<AudioRuntime>;
  setGain(gain: number): Promise<void>;
  stopAll(): void;
}
```

Throws if used outside `AudioProvider`.

`stopAll()` cancels active and scheduled playback handles created by React hooks
inside the provider. Use it for panic buttons, alert acknowledgement, or route
changes. `setGain(0)` mutes output; it does not cancel already scheduled
playback.

For guidance on choosing hooks, direct core playback, or provider-routed core
helpers, see [Hooks vs Core](./hooks-vs-core.md).

### `useAudioUnlock()`

Returns a small UX primitive for explicit browser audio enablement:

```ts
{
  unlock(): Promise<AudioRuntime>;
  status: "idle" | "unlocking" | "suspended" | "running" | "closed" | "error";
  state: AudioContextState | "idle";
  isUnlocked: boolean;
  isUnlocking: boolean;
  error: Error | null;
}
```

Use it when the app needs an `Enable Audio` button before alert sounds, live
monitoring cues, or other non-obvious playback. `unlock()` should run from a
click, tap, or keyboard handler because browser autoplay policy still requires a
user gesture. `idle` means the provider has not created the context yet,
`suspended` means the browser did not allow playback yet, `running` means audio
is ready, and `error` means a failed unlock attempt is stored in `error`.

```tsx
import { useAudioUnlock } from "@webaudio-kit/react";

function EnableAudioButton() {
  const audio = useAudioUnlock();

  return (
    <>
      <button disabled={audio.isUnlocked} onClick={() => void audio.unlock()}>
        {audio.isUnlocked ? "Audio enabled" : "Enable Audio"}
      </button>
      <span>{audio.status}</span>
      {audio.error ? <span>unlock failed</span> : null}
    </>
  );
}
```

### `useAudioEngine()`

Returns provider-scoped playback helpers for advanced React use cases:

```ts
{
  playTone(options): Promise<PlaybackHandle>;
  playFrequencySweep(options): Promise<PlaybackHandle>;
  playNoise(options): Promise<PlaybackHandle>;
  withAudioRuntime<T>(
    callback: (runtime: AudioRuntime) => T | Promise<T>,
  ): Promise<T>;
  stopAll(): void;
}
```

`playTone(options)`, `playFrequencySweep(options)`, and `playNoise(options)`
ensure/resume the provider runtime, call the matching core primitive, and route
the sound through `runtime.masterGain` so master volume and analyser canvases
still react.

```tsx
import { useAudioEngine } from "@webaudio-kit/react";

function LayeredAlertButton() {
  const engine = useAudioEngine();

  async function playLayeredAlert() {
    await engine.playTone({
      frequency: 880,
      durationMs: 160,
      gain: 0.1,
      type: "square",
    });
    await engine.playNoise({
      durationMs: 120,
      gain: 0.025,
      type: "pink",
    });
  }

  return (
    <>
      <button onClick={() => void playLayeredAlert()}>Play alert</button>
      <button onClick={() => engine.stopAll()}>Stop all</button>
    </>
  );
}
```

Use `withAudioRuntime()` when custom Web Audio code needs the provider graph
without reading nullable context fields:

```tsx
await engine.withAudioRuntime((runtime) => {
  customNode.connect(runtime.masterGain);
});
```

## `AudioProvider` State Machine

`useAudioContext().state` can return `idle`, `suspended`, `running`, or
`closed`. `idle` is a webaudio-kit state, not a native browser
`AudioContextState`. Once `AudioProvider` creates an `AudioContext`, the value
mirrors the browser context state.

Expected transitions:

- Initial render: `state` is `idle`, `audioContext`, `masterGain`, and
  `analyser` are `null`, and no Web Audio nodes exist.
- First user gesture: a hook such as `useTone().play()` or
  `ensureAudioContext()` creates the provider graph and asks the browser to
  resume audio.
- Resume allowed: the browser context becomes `running`, and the provider
  reports `running`.
- Resume deferred: some browsers create the context as `suspended` until the
  click, tap, or keyboard action is considered valid. Keep playback directly in
  the user handler.
- Stop or `stopAll()`: active and scheduled playback stops, but the shared
  context usually remains `running` or `suspended`; stopping sounds does not
  close the context.
- Provider unmount: the provider closes the context when possible, so the last
  native state may be `closed`.
- Audio unavailable or creation failed: hooks reject with the browser error and
  the provider keeps state usable for UI. If no context was created, state stays
  `idle`.

Small state badge:

```tsx
import { useAudioContext } from "@webaudio-kit/react";

function AudioStateBadge() {
  const audio = useAudioContext();
  const label =
    audio.state === "idle"
      ? "Idle: audio has not been created yet"
      : `AudioContext: ${audio.state}`;

  return <span aria-label={label}>{audio.state}</span>;
}
```

### `useTone(options)`

```tsx
const tone = useTone({ frequency: 440, gain: 0.2 });

await tone.play();
tone.stop();
```

Returns:

```ts
{
  play(overrides?: Partial<ToneOptions>): Promise<void>;
  stop(): void;
  isPlaying: boolean;
}
```

`play()` accepts overrides for one-off playback without rebuilding component
state:

```tsx
void tone.play({ frequency: 880, type: "square" });
```

Hooks can also be created without defaults when every play call supplies the
required options:

```tsx
const alertTone = useTone();

await alertTone.play({
  frequency: 880,
  durationMs: 120,
  envelope: { attackMs: 8, releaseMs: 45 },
  pattern: { repeat: 3, gapMs: 90 },
});
```

### `useFrequencySweep(options)`

```tsx
const sweep = useFrequencySweep({
  from: 250,
  to: 8000,
  durationMs: 2400,
});
```

Returns:

```ts
{
  play(overrides?: Partial<FrequencySweepOptions>): Promise<void>;
  stop(): void;
  isPlaying: boolean;
}
```

### `useNoise(options)`

```tsx
const noise = useNoise({
  type: "pink",
  durationMs: 800,
  gain: 0.08,
});

await noise.play();
noise.stop();
```

Returns:

```ts
{
  play(overrides?: Partial<NoiseOptions>): Promise<void>;
  stop(): void;
  isPlaying: boolean;
}
```

### `useAudioTestMode(options?)`

Runs a short, conservative diagnostic sequence through the provider graph.

```tsx
const testMode = useAudioTestMode();

await testMode.run();
testMode.stop();
```

Returns:

```ts
{
  currentStep: AudioTestModeStep | null;
  currentStepIndex: number;
  isRunning: boolean;
  run(): Promise<void>;
  stop(): void;
  steps: AudioTestModeStep[];
}
```

Default steps cover centered tone output, left/right pan, a short sweep, and a
pink-noise burst. The helper is for browser integration diagnostics only, not
medical or audiology testing.

### `createDefaultAudioTestModeSteps()`

Returns a copy of the default low-gain diagnostic step list used by
`useAudioTestMode()`.

### `useVolume()`

```tsx
const volume = useVolume();
await volume.setGain(0.2);
```

Returns the current master gain and a setter.

### `useAnalyser()`

```tsx
const analyser = useAnalyser();
```

Returns the current `AnalyserNode`, or `null` before the audio context exists.

### `WaveformCanvas`

```tsx
<WaveformCanvas
  backgroundColor="#10110f"
  height={180}
  strokeColor="#c8ea3a"
  style={{ width: "100%", height: 140 }}
  width={720}
/>
```

Draws analyser time-domain data from the nearest `AudioProvider`. Before
playback creates the provider graph, it renders an idle center line instead of a
blank canvas.

`width` and `height` are the canvas backing buffer used for drawing resolution.
Use forwarded canvas attributes such as `style` or `className` for responsive
CSS sizing.

Useful props:

- `width`: canvas drawing width. Defaults to `720`.
- `height`: canvas drawing height. Defaults to `180`.
- `backgroundColor`: fill color. Defaults to `#10110f`.
- `strokeColor`: live waveform color. Defaults to `#c8ea3a`.
- `idleStrokeColor`: idle center-line color. Defaults to `strokeColor`.
- `lineWidth`: canvas stroke width. Defaults to `2`.

It also accepts standard canvas attributes such as `className`, `style`, and
`aria-label`.

### `SpectrumCanvas`

```tsx
<SpectrumCanvas
  backgroundColor="#10110f"
  barColor="#8ed8ff"
  height={140}
  style={{ width: "100%", height: 120 }}
  width={720}
/>
```

Draws analyser frequency-domain data from the nearest `AudioProvider`. Before
playback creates the provider graph, it renders low idle bars so the canvas does
not appear broken.

`width` and `height` are the canvas backing buffer used for drawing resolution.
Use forwarded canvas attributes such as `style` or `className` for responsive
CSS sizing.

Useful props:

- `width`: canvas drawing width. Defaults to `720`.
- `height`: canvas drawing height. Defaults to `180`.
- `backgroundColor`: fill color. Defaults to `#10110f`.
- `barColor`: live spectrum bar color. Defaults to `#c8ea3a`.
- `idleBarColor`: idle bar color. Defaults to `barColor`.
- `barCount`: number of rendered bars. Defaults to `48`.
- `barGap`: gap between bars in canvas pixels. Defaults to `2`.
- `minBarHeight`: minimum visible bar height. Defaults to `2`.

It also accepts standard canvas attributes such as `className`, `style`, and
`aria-label`.
