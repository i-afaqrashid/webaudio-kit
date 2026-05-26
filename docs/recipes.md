# Recipes

These recipes are short copy-paste starting points for common
`@webaudio-kit/react` patterns. Keep playback inside user actions so browser
autoplay behavior can allow audio. Keep gains conservative, especially for
sweep and noise examples. These examples are browser audio prototypes, not
medical or audiology software.

Browser autoplay behavior is the main rule these recipes follow.

Live recipe demos for each pattern are available on the public recipes page:
<https://webaudio-kit.afaqrashid.com/docs/recipes>.

Not medical software: these recipes are not diagnosis, screening, or calibrated
audiology workflows.

## Tone Button

Use this when a UI needs one audible confirmation tone.

```tsx
import { AudioProvider, useTone } from "@webaudio-kit/react";

function ToneButton() {
  const tone = useTone({
    frequency: 440,
    gain: 0.14,
    type: "sine",
  });

  return (
    <>
      <button type="button" onClick={() => void tone.play({ durationMs: 600 })}>
        {tone.isPlaying ? "Restart tone" : "Play tone"}
      </button>
      <button type="button" onClick={tone.stop}>
        Stop
      </button>
    </>
  );
}

export function App() {
  return (
    <AudioProvider>
      <ToneButton />
    </AudioProvider>
  );
}
```

## Frequency Sweep Control

Use a bounded sweep when you need to prove scheduling and frequency ramping.
Avoid loud or long sweeps in demos.

```tsx
import { AudioProvider, useFrequencySweep } from "@webaudio-kit/react";

function SweepControl() {
  const sweep = useFrequencySweep({
    from: 250,
    to: 8000,
    durationMs: 2400,
    gain: 0.1,
    type: "sine",
  });

  return (
    <>
      <button type="button" onClick={() => void sweep.play()}>
        {sweep.isPlaying ? "Restart sweep" : "Run sweep"}
      </button>
      <button type="button" onClick={sweep.stop}>
        Stop
      </button>
    </>
  );
}

export function App() {
  return (
    <AudioProvider>
      <SweepControl />
    </AudioProvider>
  );
}
```

## Repeated Alert Cue

Use `pattern` for notification-style cues. The hook can be created without
defaults when each alert profile supplies full playback options at `play()` time.

```tsx
import { AudioProvider, useTone } from "@webaudio-kit/react";

const profiles = {
  warning: { frequency: 660, repeat: 2 },
  critical: { frequency: 880, repeat: 3 },
};

function AlertCueButton() {
  const alertTone = useTone();

  return (
    <button
      type="button"
      onClick={() =>
        void alertTone.play({
          frequency: profiles.critical.frequency,
          durationMs: 120,
          gain: 0.12,
          type: "square",
          envelope: { attackMs: 8, releaseMs: 45 },
          pattern: { repeat: profiles.critical.repeat, gapMs: 90 },
        })
      }
    >
      Play critical cue
    </button>
  );
}

export function App() {
  return (
    <AudioProvider>
      <AlertCueButton />
    </AudioProvider>
  );
}
```

## Soft UI Sweep

Use a short envelope for cues that should feel less abrupt, especially with
square or sawtooth tones.

```tsx
import { AudioProvider, useFrequencySweep } from "@webaudio-kit/react";

function SoftSweepButton() {
  const sweep = useFrequencySweep({
    from: 440,
    to: 880,
    durationMs: 500,
    gain: 0.12,
    type: "sine",
    envelope: { attackMs: 10, decayMs: 40, sustain: 0.7, releaseMs: 80 },
  });

  return (
    <button type="button" onClick={() => void sweep.play()}>
      Play soft sweep
    </button>
  );
}

export function App() {
  return (
    <AudioProvider>
      <SoftSweepButton />
    </AudioProvider>
  );
}
```

## Styled Alert Profiles

Use filters and detuned voices to make warning, error, and success cues distinct
without shipping audio files.

```tsx
import { AudioProvider, useTone } from "@webaudio-kit/react";

const cueProfiles = {
  success: {
    frequency: 523.25,
    type: "sine" as const,
    filter: { frequency: 3000 },
    voices: { count: 1 },
  },
  warning: {
    frequency: 660,
    type: "sawtooth" as const,
    filter: { frequency: 1800, q: 0.7 },
    voices: { count: 2, spreadCents: 10 },
  },
  error: {
    frequency: 220,
    type: "square" as const,
    filter: { frequency: 1200, q: 0.9 },
    voices: { count: 3, spreadCents: 16 },
  },
};

function AlertProfileButton() {
  const tone = useTone();

  return (
    <button
      type="button"
      onClick={() =>
        void tone.play({
          ...cueProfiles.warning,
          durationMs: 220,
          gain: 0.14,
          envelope: { attackMs: 8, releaseMs: 55 },
        })
      }
    >
      Play warning cue
    </button>
  );
}

export function App() {
  return (
    <AudioProvider>
      <AlertProfileButton />
    </AudioProvider>
  );
}
```

## Master Volume Slider

Use provider volume for one shared master gain across tone, sweep, and noise
controls.

```tsx
import { AudioProvider, useVolume } from "@webaudio-kit/react";

function MasterVolumeSlider() {
  const volume = useVolume();

  return (
    <label>
      Master volume
      <input
        max={0.5}
        min={0}
        onChange={(event) =>
          void volume.setGain(event.currentTarget.valueAsNumber)
        }
        step={0.01}
        type="range"
        value={volume.gain}
      />
    </label>
  );
}

export function App() {
  return (
    <AudioProvider initialGain={0.2}>
      <MasterVolumeSlider />
    </AudioProvider>
  );
}
```

## Waveform And Spectrum Panel

Render both analyser views next to controls so developers can see that the
provider graph is live.

```tsx
import {
  AudioProvider,
  SpectrumCanvas,
  WaveformCanvas,
} from "@webaudio-kit/react";

function SignalPanel() {
  return (
    <section aria-label="Analyser output">
      <WaveformCanvas
        aria-label="Waveform analyser"
        backgroundColor="#10110f"
        height={160}
        strokeColor="#c8ea3a"
        width={720}
      />
      <SpectrumCanvas
        aria-label="Spectrum analyser"
        backgroundColor="#10110f"
        barColor="#8ed8ff"
        barCount={48}
        height={120}
        width={720}
      />
    </section>
  );
}

export function App() {
  return (
    <AudioProvider>
      <SignalPanel />
    </AudioProvider>
  );
}
```

## Audio Test Mode

Use test mode as a developer diagnostic for the provider graph. It runs short
low-gain steps for tone output, pan, sweep scheduling, noise buffers, and
analyser routing.

```tsx
import { AudioProvider, useAudioTestMode } from "@webaudio-kit/react";

function AudioSelfCheck() {
  const testMode = useAudioTestMode();

  return (
    <section>
      <p>{testMode.currentStep?.label ?? "Idle"}</p>
      <button type="button" onClick={() => void testMode.run()}>
        {testMode.isRunning ? "Restart test mode" : "Run test mode"}
      </button>
      <button type="button" onClick={testMode.stop}>
        Stop
      </button>
      <ol>
        {testMode.steps.map((step) => (
          <li key={step.id}>{step.label}</li>
        ))}
      </ol>
    </section>
  );
}

export function App() {
  return (
    <AudioProvider>
      <AudioSelfCheck />
    </AudioProvider>
  );
}
```

## Safe Autoplay Pattern

Create and resume audio from a click, tap, or keyboard handler. Do not create
`AudioContext` at module import time. The provider and hooks already follow
this pattern; your app should avoid calling playback from render effects.

```tsx
import { AudioProvider, useTone } from "@webaudio-kit/react";

function StartAudioButton() {
  const tone = useTone({
    frequency: 660,
    gain: 0.08,
    durationMs: 300,
  });

  async function handleStart() {
    await tone.play();
  }

  return (
    <button type="button" onClick={() => void handleStart()}>
      Start audio from user action
    </button>
  );
}

export function App() {
  return (
    <AudioProvider initialGain={0.2}>
      <StartAudioButton />
    </AudioProvider>
  );
}
```

## Related

- [API reference](./api.md)
- [Browser audio guide](./browser-audio.md)
- [Examples](./examples.md)
- [Safety](./safety.md)
