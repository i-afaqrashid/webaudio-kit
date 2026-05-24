# Architecture

## Package Boundaries

`@webaudio-kit/core` is React-free. It owns Web Audio graph construction,
frequency clamping, dB/gain math, playback handles, and cleanup.

`@webaudio-kit/react` owns React ergonomics. It provides context state, lazy
`AudioContext` setup, master volume, analyser access, and hook-level playback
state.

`apps/demo` is a manual QA and public demo target. It should prove the package
APIs are usable, but it should not become the source of library behavior.

## Import-Time Safety

No package should create an `AudioContext` during module import. Browser audio
must be initialized after user interaction.

Good:

```tsx
const tone = useTone({ frequency: 440 });
<button onClick={() => void tone.play()}>Play</button>;
```

Avoid:

```ts
const context = new AudioContext();
```

at module top level.

## Provider Graph

The React provider creates:

```txt
masterGain -> analyser -> destination
```

Tone and sweep calls create short-lived source graphs:

```txt
oscillator -> gain -> panner -> masterGain
```

If `StereoPannerNode` is unavailable, core falls back to:

```txt
oscillator -> gain -> masterGain
```

## Playback Lifecycle

Each `playTone()` or `playFrequencySweep()` call creates new nodes. This avoids
reusing stopped oscillators, which the Web Audio API does not allow.

The playback handle owns:

- oscillator stop
- cleanup after `onended`
- safe disconnection
- idempotent `stop()`

React hooks own:

- current playback handle
- `isPlaying`
- timeout cleanup for finite durations
- stopping previous playback before starting a new one

## Frequency And Gain Rules

Frequencies default to the `20..20000` Hz range.

Gain defaults to `0.2`. Non-finite gain falls back to `0.2`; negative gain is
normalized to `0`.

Pan defaults to center and clamps to `-1..1`.

## Error Boundaries

Expected error surfaces:

- `useAudioContext` outside provider throws a clear React usage error.
- unsupported browsers throw `Web Audio API is not available in this browser`.
- invalid sweep duration throws `durationMs must be a positive number`.

Apps should catch playback errors near UI actions and show a small user-facing
message.

## Future Packages

Future packages should keep the same ownership boundaries:

- visualizer components should consume analyser data but not own playback
- microphone helpers should isolate permission handling
- AudioWorklet helpers should remain optional and browser-gated
