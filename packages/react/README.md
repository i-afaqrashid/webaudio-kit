# @webaudio-kit/react

React primitives for browser audio apps.

## Install

```sh
pnpm add @webaudio-kit/core @webaudio-kit/react
```

## Example

```tsx
import { AudioProvider, useTone } from "@webaudio-kit/react";

function App() {
  return (
    <AudioProvider>
      <ToneButton />
    </AudioProvider>
  );
}

function ToneButton() {
  const tone = useTone({ frequency: 440, gain: 0.2 });

  return (
    <button onClick={() => void tone.play()}>
      {tone.isPlaying ? "Restart" : "Play"}
    </button>
  );
}
```

## API

- `AudioProvider`
- `useAudioContext`
- `useTone`
- `useFrequencySweep`
- `useVolume`
- `useAnalyser`
- re-exported helpers from `@webaudio-kit/core`

See the repository API reference:
https://github.com/i-afaqrashid/webaudio-kit/blob/main/docs/api.md.

`AudioProvider` lazily creates and resumes `AudioContext` when playback starts.
This matches browser autoplay rules and keeps import-time behavior safe.

This library is for browser audio interfaces and prototypes. It is not a
certified audiology or medical testing system.
