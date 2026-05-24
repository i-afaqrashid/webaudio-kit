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
};
```

- `frequency`: tone frequency in Hz. Values are clamped to the playable range.
- `gain`: linear gain. Defaults to `0.2`.
- `type`: oscillator waveform. Defaults to `"sine"`.
- `pan`: stereo pan from `-1` left to `1` right. Defaults to `0`.
- `durationMs`: optional playback duration. If omitted, playback continues
  until stopped.

### `FrequencySweepOptions`

```ts
type FrequencySweepOptions = {
  from: number;
  to: number;
  durationMs: number;
  gain?: number;
  type?: OscillatorType;
  pan?: number;
};
```

`durationMs` is required for sweeps and must be a positive finite number.

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

## `@webaudio-kit/react`

### `AudioProvider`

```tsx
<AudioProvider initialGain={0.2}>
  <App />
</AudioProvider>
```

Creates the provider graph lazily:

```txt
tone/sweep -> masterGain -> analyser -> destination
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
}
```

Throws if used outside `AudioProvider`.

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
  width={720}
/>
```

Draws analyser time-domain data from the nearest `AudioProvider`. Before
playback creates the provider graph, it renders an idle center line instead of a
blank canvas.

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
  width={720}
/>
```

Draws analyser frequency-domain data from the nearest `AudioProvider`. Before
playback creates the provider graph, it renders low idle bars so the canvas does
not appear broken.

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
