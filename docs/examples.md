# Examples

## Site Demos

The public site has focused demo routes for the main audio surfaces:

- Tone generator: https://webaudio-kit.afaqrashid.com/demos/tone
- Frequency sweep: https://webaudio-kit.afaqrashid.com/demos/sweep
- Noise burst: https://webaudio-kit.afaqrashid.com/demos/noise
- Audio test mode: https://webaudio-kit.afaqrashid.com/demos/test-mode

Each page includes a copy-paste snippet and the full analyser-backed workspace.

## Real Example Apps

The repository keeps standalone examples under `examples/`:

- `examples/incident-alert-console`: product-style monitoring console with
  severity cues, volume control, context state, waveform, and spectrum output.
- `examples/vite-react`: main Vite React tone, sweep, noise, volume, waveform,
  and spectrum controls.
- `examples/next-app-router`: Next App Router server/client boundary for
  `AudioProvider` and hook-based controls.
- `examples/plain-react`: smallest plain React provider, tone, volume,
  waveform, and spectrum setup.
- `examples/vite-tone-panel`: legacy Vite tone panel kept for compatibility.
- `examples/next-provider-example`: legacy Next provider example kept for
  compatibility.
- `examples/audio-test-mode`: Low-gain test mode sequence with analyser output.
- `examples/agent-brief-output`: sample agent context file for Codex, Claude
  Code, Gemini CLI, OpenCode, and Antigravity.

Run `pnpm examples:check` from the repository root to pack local packages into
tarballs, install them into temporary copies of the examples, and build each
example app without workspace shortcuts.

## Run in browser

These StackBlitz links open standalone GitHub example folders. GitHub remains
the source of truth, so the examples stay aligned with the code that CI checks.

| Example                 | Browser link                                                                                                                                                                |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vite React starter      | [Run in StackBlitz](https://stackblitz.com/fork/github/i-afaqrashid/webaudio-kit/tree/main/examples/vite-react?title=webaudio-kit%20Vite%20React%20starter)                 |
| Next App Router starter | [Run in StackBlitz](https://stackblitz.com/fork/github/i-afaqrashid/webaudio-kit/tree/main/examples/next-app-router?title=webaudio-kit%20Next%20App%20Router%20starter)     |
| Incident Alert Console  | [Run in StackBlitz](https://stackblitz.com/fork/github/i-afaqrashid/webaudio-kit/tree/main/examples/incident-alert-console?title=webaudio-kit%20Incident%20Alert%20Console) |
| Audio test mode         | [Run in StackBlitz](https://stackblitz.com/fork/github/i-afaqrashid/webaudio-kit/tree/main/examples/audio-test-mode?title=webaudio-kit%20Audio%20test%20mode)               |

The default starter is also available at
https://webaudio-kit.afaqrashid.com/new.

## Tone Generator

```tsx
function ToneGenerator() {
  const [frequency, setFrequency] = useState(440);
  const tone = useTone({ frequency, gain: 0.2, type: "sine" });

  return (
    <>
      <input
        min="20"
        max="20000"
        onChange={(event) => setFrequency(Number(event.target.value))}
        type="range"
        value={frequency}
      />
      <button onClick={() => void tone.play()}>Play</button>
      <button onClick={tone.stop}>Stop</button>
    </>
  );
}
```

## Frequency Sweep

```tsx
function SweepDemo() {
  const sweep = useFrequencySweep({
    from: 250,
    to: 8000,
    durationMs: 2400,
    gain: 0.1,
  });

  return (
    <>
      <button onClick={() => void sweep.play()}>Run sweep</button>
      <button onClick={sweep.stop}>Stop</button>
    </>
  );
}
```

## Noise Burst

```tsx
function NoiseBurst() {
  const noise = useNoise({
    type: "pink",
    durationMs: 800,
    gain: 0.08,
  });

  return (
    <>
      <button onClick={() => void noise.play()}>Play pink noise</button>
      <button onClick={noise.stop}>Stop</button>
    </>
  );
}
```

## Pitch Labels

```tsx
function PitchReadout({ frequency }: { frequency: number }) {
  return (
    <span>
      {frequency} Hz / {frequencyToNoteName(frequency)}
    </span>
  );
}
```

## Volume Control

```tsx
function VolumeControl() {
  const volume = useVolume();

  return (
    <label>
      Volume
      <input
        max="1"
        min="0"
        onChange={(event) => void volume.setGain(Number(event.target.value))}
        step="0.01"
        type="range"
        value={volume.gain}
      />
    </label>
  );
}
```

## Waveform Analyser

```tsx
import { SpectrumCanvas, WaveformCanvas } from "@webaudio-kit/react";

function AnalyserPanel() {
  return (
    <>
      <WaveformCanvas
        backgroundColor="#10110f"
        height={180}
        idleStrokeColor="#394135"
        lineWidth={2}
        strokeColor="#c8ea3a"
        style={{ width: "100%", height: 140 }}
        width={720}
      />
      <SpectrumCanvas
        backgroundColor="#10110f"
        barColor="#8ed8ff"
        barCount={48}
        barGap={2}
        height={140}
        idleBarColor="#394135"
        minBarHeight={2}
        style={{ width: "100%", height: 120 }}
        width={720}
      />
    </>
  );
}
```

## Safe Audio Test Mode

```tsx
function AudioTestModePanel() {
  const testMode = useAudioTestMode();

  return (
    <section>
      <p>{testMode.currentStep?.label ?? "Idle"}</p>
      <button onClick={() => void testMode.run()}>Run test mode</button>
      <button onClick={testMode.stop}>Stop</button>
      <ol>
        {testMode.steps.map((step) => (
          <li key={step.id}>{step.label}</li>
        ))}
      </ol>
    </section>
  );
}
```

`useAudioTestMode()` is a developer diagnostic helper. It runs only after a user
action and uses conservative default gains.

## Metronome Prototype

```tsx
function Metronome() {
  const click = useTone({
    frequency: 1200,
    gain: 0.15,
    type: "square",
    durationMs: 40,
  });

  return <button onClick={() => void click.play()}>Click</button>;
}
```

For a real metronome, schedule future clicks with Web Audio time instead of
React timers alone.

## Hearing-Test-Style Prototype

```tsx
function HearingStylePrototype() {
  const tone = useTone({
    frequency: 1000,
    gain: 0.05,
    pan: 0,
    durationMs: 800,
  });

  return (
    <>
      <button onClick={() => void tone.play()}>Play tone</button>
      <button onClick={tone.stop}>Stop</button>
      <p>
        Prototype only. This is not certified audiology or medical testing
        software.
      </p>
    </>
  );
}
```

Do not describe a browser prototype as a hearing test, diagnosis, screening, or
calibrated audiology tool unless it has gone through the required clinical,
regulatory, and hardware calibration process outside this library.
