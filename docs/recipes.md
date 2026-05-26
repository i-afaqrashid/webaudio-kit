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

## Enable Audio Button

Use this when alert cues or monitoring sounds need an explicit first-run user
gesture. The button keeps status visible for `idle`, `suspended`, `running`, and
failed unlock states so the UI can explain browser autoplay behavior without
claiming the library can bypass it.

```tsx
import { AudioProvider, useAudioUnlock } from "@webaudio-kit/react";

function EnableAudioButton() {
  const audio = useAudioUnlock();

  return (
    <div>
      <button
        disabled={audio.isUnlocking || audio.isUnlocked}
        onClick={() => void audio.unlock().catch(() => undefined)}
        type="button"
      >
        {audio.isUnlocked ? "Audio enabled" : "Enable Audio"}
      </button>
      <p>Status: {audio.status}</p>
      {audio.error ? <p>unlock failed</p> : null}
    </div>
  );
}

export function App() {
  return (
    <AudioProvider>
      <EnableAudioButton />
    </AudioProvider>
  );
}
```

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

## Monitoring Alert Cues

Use severity profiles when an incident dashboard needs repeatable UI cues. Fire
audio on a state transition, not on every render. Mute suppresses new cues;
acknowledge uses `stopAll()` to cancel active and scheduled provider-owned
playback. This recipe is for product UI feedback, not certified alarms,
life-safety systems, medical software, or audiology workflows.

```tsx
import {
  AudioProvider,
  type FrequencySweepOptions,
  type ToneOptions,
  useAudioContext,
  useFrequencySweep,
  useTone,
  useVolume,
} from "@webaudio-kit/react";
import { useEffect, useRef, useState } from "react";

type Severity = "healthy" | "info" | "warning" | "critical";
type CueProfile =
  | { kind: "tone"; options: ToneOptions }
  | { kind: "sweep"; options: FrequencySweepOptions };

const severityProfiles = {
  healthy: null,
  info: {
    kind: "tone",
    options: {
      durationMs: 140,
      frequency: 523.25,
      gain: 0.06,
      type: "sine" as const,
      envelope: { attackMs: 8, releaseMs: 45 },
    },
  },
  warning: {
    kind: "tone",
    options: {
      durationMs: 130,
      frequency: 760,
      gain: 0.09,
      type: "triangle" as const,
      envelope: { attackMs: 8, releaseMs: 55 },
      pattern: { repeat: 2, gapMs: 100 },
    },
  },
  critical: {
    kind: "sweep",
    options: {
      durationMs: 620,
      from: 520,
      to: 1800,
      gain: 0.1,
      type: "sawtooth" as const,
      envelope: { attackMs: 12, releaseMs: 90 },
      filter: { frequency: 2200, q: 0.8 },
      pattern: { repeat: 2, gapMs: 140 },
    },
  },
} satisfies Record<Severity, CueProfile | null>;

function MonitoringAlertCues({ severity }: { severity: Severity }) {
  const audio = useAudioContext();
  const tone = useTone();
  const sweep = useFrequencySweep();
  const volume = useVolume();
  const previousSeverityRef = useRef<Severity>("healthy");
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const previousSeverity = previousSeverityRef.current;
    previousSeverityRef.current = severity;

    if (muted || previousSeverity === severity) {
      return;
    }

    const profile = severityProfiles[severity];

    if (!profile) {
      audio.stopAll();
      return;
    }

    if (profile.kind === "tone") {
      void tone.play(profile.options);
    } else {
      void sweep.play(profile.options);
    }
  }, [audio, muted, severity, sweep, tone]);

  async function handleMute(nextMuted: boolean) {
    setMuted(nextMuted);
    await volume.setGain(nextMuted ? 0 : 0.2);
  }

  return (
    <section aria-label="Monitoring alert cue controls">
      <button type="button" onClick={() => audio.stopAll()}>
        Acknowledge
      </button>
      <button type="button" onClick={() => void handleMute(!muted)}>
        {muted ? "Unmute" : "Mute"}
      </button>
    </section>
  );
}

export function App({ severity }: { severity: Severity }) {
  return (
    <AudioProvider initialGain={0.2}>
      <MonitoringAlertCues severity={severity} />
    </AudioProvider>
  );
}
```

## Stop All Cues

Use `stopAll()` when an acknowledge button, page transition, or emergency mute
must cancel scheduled playback. Keep `useVolume().setGain(0)` for muting output
without changing whether scheduled handles keep running.

```tsx
import {
  AudioProvider,
  useAudioContext,
  useTone,
  useVolume,
} from "@webaudio-kit/react";

function AlertControls() {
  const audio = useAudioContext();
  const volume = useVolume();
  const alertTone = useTone();

  return (
    <>
      <button
        type="button"
        onClick={() =>
          void alertTone.play({
            frequency: 880,
            durationMs: 120,
            gain: 0.12,
            pattern: { repeat: 3, gapMs: 90 },
          })
        }
      >
        Start alert
      </button>
      <button type="button" onClick={() => audio.stopAll()}>
        Stop all cues
      </button>
      <button type="button" onClick={() => void volume.setGain(0)}>
        Mute output
      </button>
    </>
  );
}

export function App() {
  return (
    <AudioProvider>
      <AlertControls />
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

## Controlled Volume Slider

Use provider gain directly for one shared master volume across tone, sweep, and
noise controls. `useVolumeControl()` avoids duplicate React state, keeps safe bounds
in one place, and can persist a browser preference with `storageKey`.

```tsx
import { AudioProvider, useVolumeControl } from "@webaudio-kit/react";

function ControlledVolumeSlider() {
  const volume = useVolumeControl({
    label: "Master volume",
    maxGain: 0.5,
    storageKey: "app-master-gain",
  });

  return (
    <label>
      Master volume
      <input {...volume.inputProps} />
      <span>{volume.gain.toFixed(2)}</span>
      <button type="button" onClick={() => void volume.resetGain()}>
        Reset volume
      </button>
    </label>
  );
}

export function App() {
  return (
    <AudioProvider initialGain={0.2}>
      <ControlledVolumeSlider />
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
        idleStrokeColor="#394135"
        lineWidth={2}
        strokeColor="#c8ea3a"
        style={{ width: "100%", height: 140 }}
        width={720}
      />
      <SpectrumCanvas
        aria-label="Spectrum analyser"
        backgroundColor="#10110f"
        barColor="#8ed8ff"
        barCount={48}
        barGap={2}
        height={120}
        idleBarColor="#394135"
        minBarHeight={2}
        style={{ width: "100%", height: 120 }}
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
