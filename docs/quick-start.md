# Quick Start

## Install

```sh
pnpm add @webaudio-kit/core @webaudio-kit/react
```

Use `npm install` or `yarn add` if your app does not use pnpm.

## Add The Provider

Wrap the part of your app that needs browser audio:

```tsx
import { AudioProvider } from "@webaudio-kit/react";

export function App() {
  return (
    <AudioProvider>
      <ToneButton />
    </AudioProvider>
  );
}
```

`AudioProvider` does not create `AudioContext` during module import. It creates
and resumes the context lazily when a hook action runs from a user gesture.

## Play A Tone

```tsx
import { useTone } from "@webaudio-kit/react";

function ToneButton() {
  const tone = useTone({
    frequency: 440,
    gain: 0.2,
    type: "sine",
  });

  return (
    <button onClick={() => void tone.play()}>
      {tone.isPlaying ? "Restart tone" : "Play tone"}
    </button>
  );
}
```

## Stop Playback

```tsx
function ToneControls() {
  const tone = useTone({ frequency: 440 });

  return (
    <>
      <button onClick={() => void tone.play()}>Play</button>
      <button onClick={tone.stop}>Stop</button>
    </>
  );
}
```

## Run A Sweep

```tsx
import { useFrequencySweep } from "@webaudio-kit/react";

function SweepButton() {
  const sweep = useFrequencySweep({
    from: 250,
    to: 8000,
    durationMs: 2400,
    gain: 0.1,
  });

  return <button onClick={() => void sweep.play()}>Run sweep</button>;
}
```

## Play Noise

```tsx
import { useNoise } from "@webaudio-kit/react";

function NoiseButton() {
  const noise = useNoise({
    type: "pink",
    durationMs: 800,
    gain: 0.08,
  });

  return <button onClick={() => void noise.play()}>Play pink noise</button>;
}
```

## Set Master Volume

```tsx
import { useVolume } from "@webaudio-kit/react";

function VolumeReset() {
  const volume = useVolume();

  return (
    <button onClick={() => void volume.setGain(0.2)}>
      Reset to safe volume: {volume.gain.toFixed(2)}
    </button>
  );
}
```

## Run Safe Test Mode

```tsx
import { useAudioTestMode } from "@webaudio-kit/react";

function AudioSelfCheck() {
  const testMode = useAudioTestMode();

  return (
    <>
      <button onClick={() => void testMode.run()}>
        {testMode.isRunning ? "Restart test mode" : "Run test mode"}
      </button>
      <button onClick={testMode.stop}>Stop</button>
      <p>{testMode.currentStep?.label ?? "Idle"}</p>
    </>
  );
}
```

The default sequence uses short low-gain steps for tone output, stereo pan,
sweep scheduling, noise buffers, and analyser routing.

## Important Browser Rule

Browsers normally block audio until playback starts from a user gesture. Call
`play()` from a click, pointer, touch, keyboard, or similar user action.

## Safety Rule

Start low. The default gain is `0.2`, but system volume, headphones, and device
output can still make tones uncomfortable.
