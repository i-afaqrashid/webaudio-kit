# Hooks vs Core

`webaudio-kit` has two public layers:

- `@webaudio-kit/react` owns React ergonomics: `AudioProvider`, hooks,
  provider-scoped master gain, analyser routing, and playback cleanup.
- `@webaudio-kit/core` owns browser-safe Web Audio primitives that can run in
  React, vanilla JavaScript, or any custom audio graph.

Use the React hooks first in React apps. Reach for core functions when a screen
needs custom routing, layered cues, or code that is not tied to React.

## Hooks first for React apps

For normal React controls, keep playback inside `AudioProvider` and use hooks.
The provider creates `AudioContext` lazily after a user interaction, routes
playback through `masterGain -> analyser -> destination`, and tracks active
handles for `audio.stopAll()`.

```tsx
import { AudioProvider, useTone } from "@webaudio-kit/react";

function CueButton() {
  const cue = useTone({
    durationMs: 180,
    frequency: 880,
    gain: 0.12,
    type: "square",
  });

  return (
    <button onClick={() => void cue.play()}>
      {cue.isPlaying ? "Restart cue" : "Play cue"}
    </button>
  );
}

export function App() {
  return (
    <AudioProvider>
      <CueButton />
    </AudioProvider>
  );
}
```

This is the preferred path when you need:

- Stable `play`, `stop`, and `isPlaying` controls.
- Browser autoplay handling through a user-triggered hook call.
- Provider `masterGain`, analyser canvases, and `stopAll()` integration.
- Less custom Web Audio code in app components.

## Core first for non-React and custom graphs

Use `@webaudio-kit/core` directly when React is not involved or when you own the
destination graph yourself.

```ts
import { playFrequencySweep, playTone } from "@webaudio-kit/core";

const audioContext = new AudioContext();
const masterGain = audioContext.createGain();
const analyser = audioContext.createAnalyser();

masterGain.gain.value = 0.2;
masterGain.connect(analyser);
analyser.connect(audioContext.destination);

await audioContext.resume();

const tone = playTone(
  audioContext,
  { durationMs: 240, frequency: 660, gain: 0.12 },
  masterGain,
);

const sweep = playFrequencySweep(
  audioContext,
  { durationMs: 700, from: 400, gain: 0.08, to: 1600 },
  masterGain,
);

tone.stop();
sweep.stop();
```

Core-first usage is a good fit for:

- Non-React apps and scripts that already create their own `AudioContext`.
- Custom node graphs, mixers, filters, or destinations.
- Advanced scheduling where your app owns every handle lifecycle.

## React + core interop

When a React screen needs one custom cue beyond the hooks, use
`useAudioContext().ensureAudioContext()` instead of direct
`audio.audioContext` null checks. `ensureAudioContext()` creates the provider
graph on demand, resumes the context when the browser allows it, and returns the
same runtime the hooks use.

That avoids direct audio.audioContext null checks in every consumer component.

```tsx
import { playNoise, playTone } from "@webaudio-kit/core";
import { useAudioContext } from "@webaudio-kit/react";

function LayeredCueButton() {
  const audio = useAudioContext();

  async function playLayeredCue() {
    const runtime = await audio.ensureAudioContext();
    const tone = playTone(
      runtime.audioContext,
      {
        durationMs: 180,
        envelope: { attackMs: 8, releaseMs: 45 },
        frequency: 880,
        gain: 0.1,
        pattern: { repeat: 2, gapMs: 80 },
        type: "square",
      },
      runtime.masterGain,
    );
    const noise = playNoise(
      runtime.audioContext,
      {
        durationMs: 120,
        envelope: { attackMs: 4, releaseMs: 50 },
        gain: 0.025,
        type: "pink",
      },
      runtime.masterGain,
    );

    setTimeout(() => {
      tone.stop();
      noise.stop();
    }, 700);
  }

  return (
    <>
      <button onClick={() => void playLayeredCue()}>Play layered cue</button>
      <button onClick={() => audio.stopAll()}>Stop hook playback</button>
    </>
  );
}
```

Passing `runtime.masterGain` is what keeps core playback inside the provider
graph:

```txt
core tone/noise/sweep -> runtime.masterGain -> analyser -> destination
```

The call shape is `playTone(runtime.audioContext, options, runtime.masterGain)`
or `playNoise(runtime.audioContext, options, runtime.masterGain)`.

That means `WaveformCanvas`, `SpectrumCanvas`, and the provider master volume
still react to the custom sound. The returned core handles remain yours to
stop. Use `audio.stopAll()` for playback created by React hooks and test mode;
track direct core handles when you create them yourself.

## Decision checklist

Use hooks when:

- The playback belongs to React UI state.
- You want `isPlaying`, automatic cleanup, and provider `stopAll()`.
- A hook already models the sound: tone, sweep, noise, volume, analyser, or test
  mode.

Use core when:

- The app is not React.
- You need a custom graph or destination node.
- You are composing a one-off layered cue and can own the returned handles.

Use both when:

- A React screen mostly uses hooks but one advanced action needs direct
  `playTone`, `playFrequencySweep`, or `playNoise`.
- You still want provider volume and analyser output for the custom cue.

## Related docs

- [API reference](./api.md)
- [Examples](./examples.md)
- [Recipes](./recipes.md)
- [Browser audio guide](./browser-audio.md)
