# Troubleshooting

## No Sound

Check:

- Was `play()` called from a user gesture?
- Is the browser tab muted?
- Is system volume low but audible?
- Is the selected output device correct?
- Is `AudioProvider` wrapping the component?
- Does the browser console show `Web Audio API is not available`?

## `useAudioContext must be used inside AudioProvider`

Wrap the component tree:

```tsx
<AudioProvider>
  <YourAudioControls />
</AudioProvider>
```

## AudioContext Stays Suspended

Move the playback call directly into the button handler:

```tsx
<button onClick={() => void tone.play()}>Play</button>
```

Avoid starting playback from `useEffect` on first render.

## Audio state stays `idle`

`idle` means `AudioProvider` has not created an `AudioContext` yet. It is a
webaudio-kit state, not a native browser `AudioContextState`. Call a hook
`play()` method or `ensureAudioContext()` from a click, tap, or keyboard handler
to let the provider create and resume the context.

See the [AudioProvider state machine](./api.md#audioprovider-state-machine) for
the full transition model.

## Sweep Throws `durationMs must be a positive number`

Sweeps require a positive finite duration:

```tsx
useFrequencySweep({
  from: 250,
  to: 8000,
  durationMs: 2400,
});
```

## Frequency Sounds Wrong

Confirm the value is in Hz, not kHz:

```tsx
frequency: 1000; // 1000 Hz
```

The library clamps frequencies to the default playable range.

## Pan Does Nothing

Some browsers or environments may not support `StereoPannerNode`. Core falls
back to a gain-only graph. Audio still plays, but stereo pan is unavailable.

## Analyser Is `null`

The analyser exists only after the provider creates the audio runtime. Start
playback or call an audio action first.

## Waveform Does Not Move

Check:

- analyser is not `null`
- canvas ref is mounted
- `requestAnimationFrame` is running
- sound is actually playing
- browser tab is visible enough to schedule animation frames

## Tests Fail In jsdom

jsdom does not implement Web Audio. Use fake `AudioContext` classes in tests,
as the package tests do.

## Browser Demo QA Fails

Run:

```sh
pnpm exec playwright install chromium firefox webkit
pnpm demo:qa
```

If Firefox or WebKit behaves differently, reduce assumptions around autoplay and
keep audio startup tied to user gestures.
