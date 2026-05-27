import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import {
  AudioProvider,
  SpectrumCanvas,
  WaveformCanvas,
  createDefaultAudioTestModeSteps,
  type PlaybackHandle,
  useAnalyser,
  useAudioContext,
  useAudioEngine,
  useAudioUnlock,
  useAudioTestMode,
  useFrequencySweep,
  useNoise,
  useTone,
  useVolume,
  useVolumeControl,
} from "./index";

class FakeAudioParam {
  value: number;
  events: Array<{ method: string; value: number; time?: number }> = [];

  constructor(value: number) {
    this.value = value;
  }

  setValueAtTime(value: number, time?: number) {
    this.value = value;
    this.events.push({ method: "setValueAtTime", value, time });
    return this;
  }

  linearRampToValueAtTime(value: number, time?: number) {
    this.value = value;
    this.events.push({ method: "linearRampToValueAtTime", value, time });
    return this;
  }

  cancelScheduledValues(time?: number) {
    this.events.push({
      method: "cancelScheduledValues",
      value: this.value,
      time,
    });
    return this;
  }
}

class FakeAudioNode {
  connections: unknown[] = [];
  disconnected = false;

  connect(destination: unknown) {
    this.connections.push(destination);
    return destination;
  }

  disconnect() {
    this.disconnected = true;
  }
}

class FakeOscillatorNode extends FakeAudioNode {
  detune = new FakeAudioParam(0);
  frequency = new FakeAudioParam(440);
  type: OscillatorType = "sine";
  startedAt?: number;
  stoppedAt?: number;
  stopCalls = 0;
  onended: (() => void) | null = null;

  start(time?: number) {
    this.startedAt = time;
  }

  stop(time?: number) {
    this.stopCalls += 1;
    this.stoppedAt = time;
    this.onended?.();
  }
}

class FakeAudioBuffer {
  channelData: Float32Array[];

  constructor(
    public numberOfChannels: number,
    public length: number,
    public sampleRate: number,
  ) {
    this.channelData = Array.from(
      { length: numberOfChannels },
      () => new Float32Array(length),
    );
  }

  getChannelData(channel: number) {
    return this.channelData[channel]!;
  }
}

class FakeAudioBufferSourceNode extends FakeAudioNode {
  buffer: AudioBuffer | null = null;
  startedAt?: number;
  stoppedAt?: number;
  stopCalls = 0;
  onended: (() => void) | null = null;

  start(time?: number) {
    this.startedAt = time;
  }

  stop(time?: number) {
    this.stopCalls += 1;
    this.stoppedAt = time;
    this.onended?.();
  }
}

class FakeGainNode extends FakeAudioNode {
  gain = new FakeAudioParam(1);
}

class FakeAnalyserNode extends FakeAudioNode {
  fftSize = 2048;
  frequencyBinCount = 1024;
  frequencyDataCalls = 0;
  timeDomainCalls = 0;

  getByteFrequencyData(data: Uint8Array) {
    this.frequencyDataCalls += 1;
    for (let index = 0; index < data.length; index += 1) {
      data[index] = index % 255;
    }
  }

  getByteTimeDomainData(data: Uint8Array) {
    this.timeDomainCalls += 1;
    data.fill(128);
  }
}

class FakeStereoPannerNode extends FakeAudioNode {
  pan = new FakeAudioParam(0);
}

class FakeBiquadFilterNode extends FakeAudioNode {
  frequency = new FakeAudioParam(350);
  Q = new FakeAudioParam(1);
  type: BiquadFilterType = "lowpass";
}

class FakeAudioContext {
  static instances: FakeAudioContext[] = [];

  currentTime = 0;
  sampleRate = 48_000;
  destination = new FakeAudioNode();
  state: AudioContextState = "suspended";
  resume = vi.fn(async () => {
    this.state = "running";
  });
  close = vi.fn(async () => {
    this.state = "closed";
  });
  oscillators: FakeOscillatorNode[] = [];
  bufferSources: FakeAudioBufferSourceNode[] = [];
  buffers: FakeAudioBuffer[] = [];
  filters: FakeBiquadFilterNode[] = [];
  gains: FakeGainNode[] = [];
  analysers: FakeAnalyserNode[] = [];
  panners: FakeStereoPannerNode[] = [];

  constructor() {
    FakeAudioContext.instances.push(this);
  }

  createOscillator() {
    const oscillator = new FakeOscillatorNode();
    this.oscillators.push(oscillator);
    return oscillator;
  }

  createBuffer(numberOfChannels: number, length: number, sampleRate: number) {
    const buffer = new FakeAudioBuffer(numberOfChannels, length, sampleRate);
    this.buffers.push(buffer);
    return buffer;
  }

  createBufferSource() {
    const source = new FakeAudioBufferSourceNode();
    this.bufferSources.push(source);
    return source;
  }

  createGain() {
    const gain = new FakeGainNode();
    this.gains.push(gain);
    return gain;
  }

  createBiquadFilter() {
    const filter = new FakeBiquadFilterNode();
    this.filters.push(filter);
    return filter;
  }

  createAnalyser() {
    const analyser = new FakeAnalyserNode();
    this.analysers.push(analyser);
    return analyser;
  }

  createStereoPanner() {
    const panner = new FakeStereoPannerNode();
    this.panners.push(panner);
    return panner;
  }
}

class DelayedFakeAudioContext extends FakeAudioContext {
  currentTime = 5;
}

class StillSuspendedAudioContext extends FakeAudioContext {
  resume = vi.fn(async () => undefined);
}

class ThrowingAudioContext {
  constructor() {
    throw new Error("AudioContext denied");
  }
}

afterEach(() => {
  cleanup();
  FakeAudioContext.instances = [];
  window.localStorage.clear();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function Harness() {
  const audio = useAudioContext();
  const tone = useTone({ frequency: 440 });
  const sweep = useFrequencySweep({ from: 250, to: 8000, durationMs: 1000 });
  const noise = useNoise({ durationMs: 500, gain: 0.05, type: "white" });
  const volume = useVolume();
  const analyser = useAnalyser();

  return (
    <div>
      <span data-testid="context-ready">
        {String(Boolean(audio.audioContext))}
      </span>
      <span data-testid="tone-playing">{String(tone.isPlaying)}</span>
      <span data-testid="sweep-playing">{String(sweep.isPlaying)}</span>
      <span data-testid="noise-playing">{String(noise.isPlaying)}</span>
      <span data-testid="volume">{volume.gain.toFixed(1)}</span>
      <span data-testid="analyser-ready">{String(Boolean(analyser))}</span>
      <button type="button" onClick={() => void tone.play()}>
        play tone
      </button>
      <button type="button" onClick={() => tone.stop()}>
        stop tone
      </button>
      <button type="button" onClick={() => void sweep.play()}>
        play sweep
      </button>
      <button type="button" onClick={() => sweep.stop()}>
        stop sweep
      </button>
      <button type="button" onClick={() => void noise.play()}>
        play noise
      </button>
      <button type="button" onClick={() => noise.stop()}>
        stop noise
      </button>
      <button type="button" onClick={() => void volume.setGain(0.4)}>
        set volume
      </button>
      <button type="button" onClick={() => void volume.setGain(-1)}>
        mute volume
      </button>
      <button type="button" onClick={() => void volume.setGain(Number.NaN)}>
        reset bad volume
      </button>
      <button type="button" onClick={() => audio.stopAll()}>
        stop all
      </button>
    </div>
  );
}

function MissingProviderHarness() {
  useAudioContext();
  return null;
}

function UnlockHarness() {
  const unlock = useAudioUnlock();

  return (
    <div>
      <span data-testid="unlock-state">{unlock.state}</span>
      <span data-testid="unlock-status">{unlock.status}</span>
      <span data-testid="unlock-ready">{String(unlock.isUnlocked)}</span>
      <span data-testid="unlocking">{String(unlock.isUnlocking)}</span>
      <span data-testid="unlock-error">{unlock.error?.message ?? "none"}</span>
      <button
        type="button"
        onClick={() => void unlock.unlock().catch(() => undefined)}
      >
        enable audio
      </button>
    </div>
  );
}

function EngineHarness() {
  const engine = useAudioEngine();
  const [savedHandle, setSavedHandle] = useState<PlaybackHandle | null>(null);
  const [runtimeTarget, setRuntimeTarget] = useState("idle");

  return (
    <div>
      <span data-testid="engine-state">{engine.state}</span>
      <span data-testid="engine-runtime-target">{runtimeTarget}</span>
      <button
        type="button"
        onClick={() =>
          void (async () => {
            const tone = await engine.playTone({
              frequency: 880,
              gain: 0.1,
            });
            await engine.playNoise({
              durationMs: 120,
              gain: 0.025,
              type: "pink",
            });
            setSavedHandle(tone);
          })()
        }
      >
        engine layered
      </button>
      <button
        type="button"
        onClick={() =>
          void engine.playFrequencySweep({
            durationMs: 500,
            from: 250,
            gain: 0.05,
            to: 1200,
          })
        }
      >
        engine sweep
      </button>
      <button
        type="button"
        onClick={() =>
          void engine.playTone({
            durationMs: 50,
            frequency: 660,
            gain: 0.08,
          })
        }
      >
        engine timed tone
      </button>
      <button
        type="button"
        onClick={() =>
          void engine.withAudioRuntime((runtime) => {
            const masterGain = runtime.masterGain as unknown as {
              connections: unknown[];
            };
            setRuntimeTarget(
              masterGain.connections.includes(runtime.analyser)
                ? "provider"
                : "other",
            );
          })
        }
      >
        engine runtime
      </button>
      <button type="button" onClick={() => savedHandle?.stop()}>
        engine handle stop
      </button>
      <button type="button" onClick={() => engine.stopAll()}>
        engine stop all
      </button>
    </div>
  );
}

function VolumeControlHarness({
  storageKey,
  onStorageError,
}: {
  storageKey?: string;
  onStorageError?: (error: Error) => void;
}) {
  const volume = useVolumeControl({
    defaultGain: 0.2,
    label: "Alert volume",
    maxGain: 0.5,
    minGain: 0,
    onStorageError,
    step: 0.01,
    storageKey,
  });

  return (
    <div>
      <span data-testid="volume-control-gain">{volume.gain.toFixed(2)}</span>
      <span data-testid="volume-control-db">{volume.db.toFixed(1)}</span>
      <input data-testid="volume-control-input" {...volume.inputProps} />
      <button type="button" onClick={() => void volume.setGain(2)}>
        set high volume
      </button>
      <button type="button" onClick={() => void volume.resetGain()}>
        reset volume
      </button>
    </div>
  );
}

function ToneOptionsHarness() {
  const [frequency, setFrequency] = useState(440);
  const tone = useTone({
    frequency,
    gain: 0.1,
    pan: -0.25,
    type: "sine",
  });

  return (
    <div>
      <button type="button" onClick={() => setFrequency(660)}>
        set frequency
      </button>
      <button
        type="button"
        onClick={() => void tone.play({ gain: 0.3, pan: 0.5, type: "square" })}
      >
        play override
      </button>
    </div>
  );
}

function TimedToneHarness() {
  const tone = useTone({ frequency: 440, durationMs: 50 });

  return (
    <div>
      <span data-testid="timed-playing">{String(tone.isPlaying)}</span>
      <button type="button" onClick={() => void tone.play()}>
        play timed
      </button>
      <button type="button" onClick={() => tone.stop()}>
        stop timed
      </button>
    </div>
  );
}

function TimedNoiseHarness() {
  const noise = useNoise({ durationMs: 50, type: "brown" });

  return (
    <div>
      <span data-testid="timed-noise-playing">{String(noise.isPlaying)}</span>
      <button type="button" onClick={() => void noise.play()}>
        play timed noise
      </button>
      <button type="button" onClick={() => noise.stop()}>
        stop timed noise
      </button>
    </div>
  );
}

function PatternToneHarness() {
  const audio = useAudioContext();
  const tone = useTone();

  return (
    <div>
      <span data-testid="pattern-playing">{String(tone.isPlaying)}</span>
      <button
        type="button"
        onClick={() =>
          void tone.play({
            durationMs: 50,
            frequency: 660,
            pattern: { repeat: 3, gapMs: 25 },
          })
        }
      >
        play pattern tone
      </button>
      <button type="button" onClick={() => tone.stop()}>
        stop pattern tone
      </button>
      <button type="button" onClick={() => audio.stopAll()}>
        stop all pattern
      </button>
    </div>
  );
}

function EnvelopeToneHarness() {
  const tone = useTone({
    frequency: 440,
    gain: 0.2,
    durationMs: 200,
    envelope: { attackMs: 10, releaseMs: 40 },
  });

  return (
    <div>
      <span data-testid="envelope-playing">{String(tone.isPlaying)}</span>
      <button
        type="button"
        onClick={() =>
          void tone.play({
            envelope: {
              attackMs: 20,
              decayMs: 30,
              sustain: 0.5,
              releaseMs: 60,
            },
          })
        }
      >
        play envelope tone
      </button>
    </div>
  );
}

function VoiceFilterToneHarness() {
  const tone = useTone({
    frequency: 440,
    durationMs: 100,
    gain: 0.18,
    filter: { frequency: 1500, q: 0.8 },
    voices: { count: 2, spreadCents: 10 },
  });

  return (
    <div>
      <button type="button" onClick={() => void tone.play()}>
        play voiced tone
      </button>
    </div>
  );
}

function AudioTestModeHarness() {
  const testMode = useAudioTestMode({
    gapMs: 20,
    steps: [
      {
        description: "Short center tone",
        durationMs: 50,
        id: "tone-center",
        kind: "tone",
        label: "Center tone",
        tone: { frequency: 440, gain: 0.05, pan: 0, durationMs: 50 },
      },
      {
        description: "Short left pan tone",
        durationMs: 50,
        id: "tone-left",
        kind: "tone",
        label: "Left tone",
        tone: { frequency: 660, gain: 0.04, pan: -0.8, durationMs: 50 },
      },
      {
        description: "Short pink-noise burst",
        durationMs: 50,
        id: "noise",
        kind: "noise",
        label: "Pink noise",
        noise: { durationMs: 50, gain: 0.03, type: "pink" },
      },
    ],
  });

  return (
    <div>
      <span data-testid="test-running">{String(testMode.isRunning)}</span>
      <span data-testid="test-index">{testMode.currentStepIndex}</span>
      <span data-testid="test-label">
        {testMode.currentStep?.label ?? "idle"}
      </span>
      <span data-testid="test-preview-index">{testMode.previewStepIndex}</span>
      <span data-testid="test-preview-label">
        {testMode.previewStep?.label ?? "none"}
      </span>
      <span data-testid="test-count">{testMode.steps.length}</span>
      <button type="button" onClick={() => void testMode.run()}>
        run test mode
      </button>
      <button type="button" onClick={testMode.stop}>
        stop test mode
      </button>
    </div>
  );
}

function RestartingAudioTestModeHarness() {
  const testMode = useAudioTestMode({
    gapMs: 0,
    steps: [
      {
        description: "Long center tone",
        durationMs: 100,
        id: "tone-center",
        kind: "tone",
        label: "Center tone",
        tone: { frequency: 440, gain: 0.05, pan: 0, durationMs: 100 },
      },
    ],
  });

  return (
    <div>
      <span data-testid="restart-running">{String(testMode.isRunning)}</span>
      <button type="button" onClick={() => void testMode.run()}>
        restartable test mode
      </button>
    </div>
  );
}

function MissingAudioApiHarness() {
  const tone = useTone({ frequency: 440 });
  const [error, setError] = useState("");

  return (
    <div>
      <span data-testid="play-error">{error}</span>
      <button
        type="button"
        onClick={() =>
          void tone.play().catch((caught) => setError(String(caught)))
        }
      >
        play unavailable
      </button>
    </div>
  );
}

function MissingAudioTestModeApiHarness() {
  const testMode = useAudioTestMode();
  const [error, setError] = useState("");

  return (
    <div>
      <span data-testid="test-mode-error">{error}</span>
      <span data-testid="test-mode-running">{String(testMode.isRunning)}</span>
      <button
        type="button"
        onClick={() =>
          void testMode.run().catch((caught) => setError(String(caught)))
        }
      >
        run unavailable test mode
      </button>
    </div>
  );
}

function createCanvasContext() {
  return {
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    lineTo: vi.fn(),
    moveTo: vi.fn(),
    stroke: vi.fn(),
    fillStyle: "",
    lineWidth: 1,
    strokeStyle: "",
  } as unknown as CanvasRenderingContext2D;
}

describe("AudioProvider", () => {
  test("throws a clear error when hooks are used outside AudioProvider", () => {
    expect(() => render(<MissingProviderHarness />)).toThrow(
      "useAudioContext must be used inside AudioProvider",
    );
  });

  test("lazily creates and resumes an AudioContext when tone playback starts", async () => {
    vi.stubGlobal("AudioContext", FakeAudioContext);

    render(
      <AudioProvider>
        <Harness />
      </AudioProvider>,
    );

    expect(FakeAudioContext.instances).toHaveLength(0);
    expect(screen.getByTestId("context-ready").textContent).toBe("false");

    await act(async () => {
      screen.getByRole("button", { name: "play tone" }).click();
    });

    expect(FakeAudioContext.instances).toHaveLength(1);
    expect(FakeAudioContext.instances[0]?.resume).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("context-ready").textContent).toBe("true");
    expect(screen.getByTestId("tone-playing").textContent).toBe("true");
    expect(screen.getByTestId("analyser-ready").textContent).toBe("true");
    expect(FakeAudioContext.instances[0]?.gains[0]?.connections).toEqual([
      FakeAudioContext.instances[0]?.analysers[0],
    ]);
    expect(FakeAudioContext.instances[0]?.analysers[0]?.connections).toEqual([
      FakeAudioContext.instances[0]?.destination,
    ]);
  });

  test("stop clears current tone playback state", async () => {
    vi.stubGlobal("AudioContext", FakeAudioContext);

    render(
      <AudioProvider>
        <Harness />
      </AudioProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "play tone" }).click();
    });
    await act(async () => {
      screen.getByRole("button", { name: "stop tone" }).click();
    });

    expect(screen.getByTestId("tone-playing").textContent).toBe("false");
  });

  test("useAudioUnlock exposes an explicit user-gesture unlock control", async () => {
    vi.stubGlobal("AudioContext", FakeAudioContext);

    render(
      <AudioProvider>
        <UnlockHarness />
      </AudioProvider>,
    );

    expect(FakeAudioContext.instances).toHaveLength(0);
    expect(screen.getByTestId("unlock-state").textContent).toBe("idle");
    expect(screen.getByTestId("unlock-status").textContent).toBe("idle");
    expect(screen.getByTestId("unlock-ready").textContent).toBe("false");

    await act(async () => {
      screen.getByRole("button", { name: "enable audio" }).click();
    });

    expect(FakeAudioContext.instances).toHaveLength(1);
    expect(FakeAudioContext.instances[0]?.resume).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("unlock-state").textContent).toBe("running");
    expect(screen.getByTestId("unlock-status").textContent).toBe("running");
    expect(screen.getByTestId("unlock-ready").textContent).toBe("true");
    expect(screen.getByTestId("unlock-error").textContent).toBe("none");
  });

  test("useAudioUnlock reports suspended status when the browser keeps audio blocked", async () => {
    vi.stubGlobal("AudioContext", StillSuspendedAudioContext);

    render(
      <AudioProvider>
        <UnlockHarness />
      </AudioProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "enable audio" }).click();
    });

    expect(screen.getByTestId("unlock-state").textContent).toBe("suspended");
    expect(screen.getByTestId("unlock-status").textContent).toBe("suspended");
    expect(screen.getByTestId("unlock-ready").textContent).toBe("false");
  });

  test("useAudioUnlock stores unlock failures for user-facing retry UI", async () => {
    vi.stubGlobal("AudioContext", ThrowingAudioContext);

    render(
      <AudioProvider>
        <UnlockHarness />
      </AudioProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "enable audio" }).click();
    });

    expect(screen.getByTestId("unlock-state").textContent).toBe("idle");
    expect(screen.getByTestId("unlock-status").textContent).toBe("error");
    expect(screen.getByTestId("unlock-ready").textContent).toBe("false");
    expect(screen.getByTestId("unlock-error").textContent).toBe(
      "AudioContext denied",
    );
  });

  test("sets master volume and starts frequency sweeps through the provider graph", async () => {
    vi.stubGlobal("AudioContext", FakeAudioContext);

    render(
      <AudioProvider>
        <Harness />
      </AudioProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "set volume" }).click();
    });
    await act(async () => {
      screen.getByRole("button", { name: "play sweep" }).click();
    });

    expect(screen.getByTestId("volume").textContent).toBe("0.4");
    expect(screen.getByTestId("sweep-playing").textContent).toBe("true");
    expect(FakeAudioContext.instances[0]?.gains[0]?.gain.value).toBe(0.4);
    expect(
      FakeAudioContext.instances[0]?.oscillators[0]?.frequency.events,
    ).toEqual([
      { method: "cancelScheduledValues", value: 440, time: 0 },
      { method: "setValueAtTime", value: 250, time: 0 },
      { method: "linearRampToValueAtTime", value: 8000, time: 1 },
    ]);
  });

  test("starts noise playback through the provider graph", async () => {
    vi.stubGlobal("AudioContext", FakeAudioContext);

    render(
      <AudioProvider>
        <Harness />
      </AudioProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "play noise" }).click();
    });

    const context = FakeAudioContext.instances[0]!;
    expect(screen.getByTestId("noise-playing").textContent).toBe("true");
    expect(context.bufferSources).toHaveLength(1);
    expect(context.buffers[0]?.length).toBe(24_000);
    expect(context.bufferSources[0]?.connections).toEqual([context.gains[1]]);
    expect(context.gains[1]?.connections).toEqual([context.panners[0]]);
    expect(context.panners[0]?.connections).toEqual([context.gains[0]]);
  });

  test("stopAll stops every active hook playback and clears hook state", async () => {
    vi.stubGlobal("AudioContext", FakeAudioContext);

    render(
      <AudioProvider>
        <Harness />
      </AudioProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "play tone" }).click();
    });
    await act(async () => {
      screen.getByRole("button", { name: "play sweep" }).click();
    });
    await act(async () => {
      screen.getByRole("button", { name: "play noise" }).click();
    });

    await act(async () => {
      screen.getByRole("button", { name: "stop all" }).click();
    });

    const context = FakeAudioContext.instances[0]!;
    expect(screen.getByTestId("tone-playing").textContent).toBe("false");
    expect(screen.getByTestId("sweep-playing").textContent).toBe("false");
    expect(screen.getByTestId("noise-playing").textContent).toBe("false");
    expect(
      context.oscillators.every((oscillator) => oscillator.stopCalls > 0),
    ).toBe(true);
    expect(context.bufferSources.every((source) => source.stopCalls > 0)).toBe(
      true,
    );
  });

  test("useAudioEngine creates provider-routed layered playback", async () => {
    vi.stubGlobal("AudioContext", FakeAudioContext);

    render(
      <AudioProvider>
        <EngineHarness />
      </AudioProvider>,
    );

    expect(FakeAudioContext.instances).toHaveLength(0);
    expect(screen.getByTestId("engine-state").textContent).toBe("idle");

    await act(async () => {
      screen.getByRole("button", { name: "engine layered" }).click();
    });

    const context = FakeAudioContext.instances[0]!;
    expect(context.resume).toHaveBeenCalledTimes(1);
    expect(context.oscillators).toHaveLength(1);
    expect(context.bufferSources).toHaveLength(1);
    expect(context.oscillators[0]?.connections).toEqual([context.gains[1]]);
    expect(context.gains[1]?.connections).toEqual([context.panners[0]]);
    expect(context.panners[0]?.connections).toEqual([context.gains[0]]);
    expect(context.bufferSources[0]?.connections).toEqual([context.gains[2]]);
    expect(context.gains[2]?.connections).toEqual([context.panners[1]]);
    expect(context.panners[1]?.connections).toEqual([context.gains[0]]);
  });

  test("useAudioEngine exposes provider runtime without raw context null checks", async () => {
    vi.stubGlobal("AudioContext", FakeAudioContext);

    render(
      <AudioProvider>
        <EngineHarness />
      </AudioProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "engine runtime" }).click();
    });

    expect(screen.getByTestId("engine-runtime-target").textContent).toBe(
      "provider",
    );
    expect(FakeAudioContext.instances[0]?.resume).toHaveBeenCalledTimes(1);
  });

  test("useAudioEngine stopAll stops provider-scoped core handles", async () => {
    vi.stubGlobal("AudioContext", FakeAudioContext);

    render(
      <AudioProvider>
        <EngineHarness />
      </AudioProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "engine layered" }).click();
    });
    await act(async () => {
      screen.getByRole("button", { name: "engine stop all" }).click();
    });

    const context = FakeAudioContext.instances[0]!;
    expect(context.oscillators[0]?.stopCalls).toBe(1);
    expect(context.bufferSources[0]?.stopCalls).toBeGreaterThan(0);
  });

  test("useAudioEngine removes timed handles from stopAll after playback ends", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("AudioContext", FakeAudioContext);

    render(
      <AudioProvider>
        <EngineHarness />
      </AudioProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "engine timed tone" }).click();
    });
    await act(async () => {
      vi.advanceTimersByTime(50);
    });
    await act(async () => {
      screen.getByRole("button", { name: "engine stop all" }).click();
    });

    expect(FakeAudioContext.instances[0]?.oscillators[0]?.stopCalls).toBe(1);
  });

  test("normalizes initial and updated volume values", async () => {
    vi.stubGlobal("AudioContext", FakeAudioContext);

    render(
      <AudioProvider initialGain={-1}>
        <Harness />
      </AudioProvider>,
    );

    expect(screen.getByTestId("volume").textContent).toBe("0.0");

    await act(async () => {
      screen.getByRole("button", { name: "play tone" }).click();
    });

    expect(FakeAudioContext.instances[0]?.gains[0]?.gain.value).toBe(0);

    await act(async () => {
      screen.getByRole("button", { name: "reset bad volume" }).click();
    });

    expect(screen.getByTestId("volume").textContent).toBe("0.2");
    expect(FakeAudioContext.instances[0]?.gains[0]?.gain.value).toBe(0.2);

    await act(async () => {
      screen.getByRole("button", { name: "mute volume" }).click();
    });

    expect(screen.getByTestId("volume").textContent).toBe("0.0");
    expect(FakeAudioContext.instances[0]?.gains[0]?.gain.value).toBe(0);
  });

  test("useVolumeControl drives a controlled slider from provider gain", async () => {
    render(
      <AudioProvider initialGain={0.2}>
        <VolumeControlHarness />
      </AudioProvider>,
    );

    const input = screen.getByTestId(
      "volume-control-input",
    ) as HTMLInputElement;
    expect(screen.getByTestId("volume-control-gain").textContent).toBe("0.20");
    expect(input.value).toBe("0.2");
    expect(input.min).toBe("0");
    expect(input.max).toBe("0.5");
    expect(input.step).toBe("0.01");
    expect(input.getAttribute("aria-label")).toBe("Alert volume");

    fireEvent.change(input, { target: { value: "0.35" } });

    expect(screen.getByTestId("volume-control-gain").textContent).toBe("0.35");
    expect(input.value).toBe("0.35");
    expect(screen.getByTestId("volume-control-db").textContent).toBe("-9.1");
  });

  test("useVolumeControl clamps helper updates to the configured safe range", async () => {
    render(
      <AudioProvider initialGain={0.2}>
        <VolumeControlHarness />
      </AudioProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "set high volume" }).click();
    });

    expect(screen.getByTestId("volume-control-gain").textContent).toBe("0.50");
  });

  test("useVolumeControl invokes onStorageError when localStorage.setItem throws", async () => {
    const setItemSpy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });
    const onStorageError = vi.fn();

    try {
      render(
        <AudioProvider initialGain={0.2}>
          <VolumeControlHarness
            onStorageError={onStorageError}
            storageKey="wk-volume-err"
          />
        </AudioProvider>,
      );

      await act(async () => {
        screen.getByRole("button", { name: "set high volume" }).click();
      });

      expect(setItemSpy).toHaveBeenCalled();
      expect(onStorageError).toHaveBeenCalledTimes(1);
      expect(onStorageError.mock.calls[0]?.[0]).toBeInstanceOf(Error);
      expect(onStorageError.mock.calls[0]?.[0]?.message).toBe(
        "QuotaExceededError",
      );
      expect(screen.getByTestId("volume-control-gain").textContent).toBe(
        "0.50",
      );
    } finally {
      setItemSpy.mockRestore();
    }
  });

  test("useVolumeControl invokes onStorageError when localStorage.removeItem throws on reset", async () => {
    window.localStorage.setItem("wk-volume-reset-err", "0.3");
    const removeItemSpy = vi
      .spyOn(Storage.prototype, "removeItem")
      .mockImplementation(() => {
        throw new Error("storage disabled");
      });
    const onStorageError = vi.fn();

    try {
      render(
        <AudioProvider initialGain={0.2}>
          <VolumeControlHarness
            onStorageError={onStorageError}
            storageKey="wk-volume-reset-err"
          />
        </AudioProvider>,
      );

      await act(async () => {
        screen.getByRole("button", { name: "reset volume" }).click();
      });

      expect(removeItemSpy).toHaveBeenCalled();
      expect(onStorageError).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("volume-control-gain").textContent).toBe(
        "0.20",
      );
    } finally {
      removeItemSpy.mockRestore();
    }
  });

  test("useVolumeControl restores the stored gain before the first paint", () => {
    window.localStorage.setItem("wk-volume-first-paint", "0.42");

    render(
      <AudioProvider initialGain={0.2}>
        <VolumeControlHarness storageKey="wk-volume-first-paint" />
      </AudioProvider>,
    );

    expect(screen.getByTestId("volume-control-gain").textContent).toBe("0.42");
    expect(
      (screen.getByTestId("volume-control-input") as HTMLInputElement).value,
    ).toBe("0.42");
  });

  test("useVolumeControl restores and resets a persisted preference", async () => {
    window.localStorage.setItem("wk-volume", "0.33");

    render(
      <AudioProvider initialGain={0.2}>
        <VolumeControlHarness storageKey="wk-volume" />
      </AudioProvider>,
    );

    await act(async () => undefined);

    expect(screen.getByTestId("volume-control-gain").textContent).toBe("0.33");
    expect(window.localStorage.getItem("wk-volume")).toBe("0.33");

    await act(async () => {
      screen.getByRole("button", { name: "reset volume" }).click();
    });

    expect(screen.getByTestId("volume-control-gain").textContent).toBe("0.20");
    expect(window.localStorage.getItem("wk-volume")).toBe(null);
  });

  test("supports webkitAudioContext fallback", async () => {
    vi.stubGlobal("AudioContext", undefined);
    vi.stubGlobal("webkitAudioContext", FakeAudioContext);

    render(
      <AudioProvider>
        <Harness />
      </AudioProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "play tone" }).click();
    });

    expect(FakeAudioContext.instances).toHaveLength(1);
    expect(screen.getByTestId("tone-playing").textContent).toBe("true");
  });

  test("reuses one AudioContext across tone and sweep playback", async () => {
    vi.stubGlobal("AudioContext", FakeAudioContext);

    render(
      <AudioProvider>
        <Harness />
      </AudioProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "play tone" }).click();
    });
    FakeAudioContext.instances[0]!.state = "suspended";
    await act(async () => {
      screen.getByRole("button", { name: "play sweep" }).click();
    });

    expect(FakeAudioContext.instances).toHaveLength(1);
    expect(FakeAudioContext.instances[0]?.resume).toHaveBeenCalledTimes(2);
    expect(FakeAudioContext.instances[0]?.oscillators).toHaveLength(2);
  });

  test("applies latest hook options and play overrides to tone playback", async () => {
    vi.stubGlobal("AudioContext", FakeAudioContext);

    render(
      <AudioProvider>
        <ToneOptionsHarness />
      </AudioProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "set frequency" }).click();
    });
    await act(async () => {
      screen.getByRole("button", { name: "play override" }).click();
    });

    const context = FakeAudioContext.instances[0]!;
    expect(context.oscillators[0]?.frequency.value).toBe(660);
    expect(context.oscillators[0]?.type).toBe("square");
    expect(context.gains[1]?.gain.value).toBe(0.3);
    expect(context.panners[0]?.pan.value).toBe(0.5);
  });

  test("clears timed tone state after the requested duration", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("AudioContext", FakeAudioContext);

    render(
      <AudioProvider>
        <TimedToneHarness />
      </AudioProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "play timed" }).click();
    });

    expect(screen.getByTestId("timed-playing").textContent).toBe("true");

    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    expect(screen.getByTestId("timed-playing").textContent).toBe("false");
  });

  test("clears timed noise state after the requested duration", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("AudioContext", FakeAudioContext);

    render(
      <AudioProvider>
        <TimedNoiseHarness />
      </AudioProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "play timed noise" }).click();
    });

    expect(screen.getByTestId("timed-noise-playing").textContent).toBe("true");

    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    expect(screen.getByTestId("timed-noise-playing").textContent).toBe("false");
  });

  test("supports per-play tone patterns without construction-time defaults", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("AudioContext", FakeAudioContext);

    render(
      <AudioProvider>
        <PatternToneHarness />
      </AudioProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "play pattern tone" }).click();
    });

    const context = FakeAudioContext.instances[0]!;
    expect(screen.getByTestId("pattern-playing").textContent).toBe("true");
    expect(context.oscillators).toHaveLength(3);
    expect(context.oscillators[0]?.startedAt).toBe(0);
    expect(context.oscillators[1]?.startedAt).toBeCloseTo(0.075);
    expect(context.oscillators[2]?.startedAt).toBeCloseTo(0.15);

    await act(async () => {
      vi.advanceTimersByTime(199);
    });

    expect(screen.getByTestId("pattern-playing").textContent).toBe("true");

    await act(async () => {
      vi.advanceTimersByTime(1);
    });

    expect(screen.getByTestId("pattern-playing").textContent).toBe("false");
  });

  test("stopAll cancels repeated pattern playback and clears its timer", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("AudioContext", FakeAudioContext);

    render(
      <AudioProvider>
        <PatternToneHarness />
      </AudioProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "play pattern tone" }).click();
    });

    const context = FakeAudioContext.instances[0]!;
    expect(context.oscillators).toHaveLength(3);
    expect(screen.getByTestId("pattern-playing").textContent).toBe("true");

    await act(async () => {
      screen.getByRole("button", { name: "stop all pattern" }).click();
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByTestId("pattern-playing").textContent).toBe("false");
    expect(
      context.oscillators.every((oscillator) => oscillator.stopCalls > 1),
    ).toBe(true);
  });

  test("passes envelope overrides through tone playback", async () => {
    vi.stubGlobal("AudioContext", FakeAudioContext);

    render(
      <AudioProvider>
        <EnvelopeToneHarness />
      </AudioProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "play envelope tone" }).click();
    });

    const context = FakeAudioContext.instances[0]!;
    expect(screen.getByTestId("envelope-playing").textContent).toBe("true");
    expect(context.gains[1]?.gain.events).toEqual([
      { method: "cancelScheduledValues", value: 1, time: 0 },
      { method: "setValueAtTime", value: 0, time: 0 },
      { method: "linearRampToValueAtTime", value: 0.2, time: 0.02 },
      { method: "linearRampToValueAtTime", value: 0.1, time: 0.05 },
      { method: "setValueAtTime", value: 0.1, time: 0.14 },
      { method: "linearRampToValueAtTime", value: 0, time: 0.2 },
    ]);
  });

  test("passes voice and filter options through tone playback", async () => {
    vi.stubGlobal("AudioContext", FakeAudioContext);

    render(
      <AudioProvider>
        <VoiceFilterToneHarness />
      </AudioProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "play voiced tone" }).click();
    });

    const context = FakeAudioContext.instances[0]!;
    expect(context.oscillators).toHaveLength(2);
    expect(context.filters).toHaveLength(2);
    expect(
      context.oscillators.map((oscillator) => oscillator.detune.value),
    ).toEqual([-5, 5]);
    expect(context.gains.slice(1).map((gain) => gain.gain.value)).toEqual([
      0.09, 0.09,
    ]);
    expect(context.filters[0]?.frequency.value).toBe(1500);
    expect(context.filters[0]?.Q.value).toBe(0.8);
  });

  test("runs audio test mode steps sequentially with conservative playback", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("AudioContext", FakeAudioContext);

    render(
      <AudioProvider>
        <AudioTestModeHarness />
      </AudioProvider>,
    );

    expect(screen.getByTestId("test-count").textContent).toBe("3");
    expect(screen.getByTestId("test-label").textContent).toBe("idle");
    expect(screen.getByTestId("test-preview-index").textContent).toBe("0");
    expect(screen.getByTestId("test-preview-label").textContent).toBe(
      "Center tone",
    );

    await act(async () => {
      screen.getByRole("button", { name: "run test mode" }).click();
    });

    expect(screen.getByTestId("test-running").textContent).toBe("true");
    expect(screen.getByTestId("test-index").textContent).toBe("0");
    expect(screen.getByTestId("test-label").textContent).toBe("Center tone");
    expect(screen.getByTestId("test-preview-label").textContent).toBe(
      "Center tone",
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(70);
    });

    expect(screen.getByTestId("test-index").textContent).toBe("1");
    expect(screen.getByTestId("test-label").textContent).toBe("Left tone");
    expect(screen.getByTestId("test-preview-index").textContent).toBe("1");
    expect(screen.getByTestId("test-preview-label").textContent).toBe(
      "Left tone",
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(70);
    });

    expect(screen.getByTestId("test-index").textContent).toBe("2");
    expect(screen.getByTestId("test-label").textContent).toBe("Pink noise");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(70);
    });

    expect(screen.getByTestId("test-running").textContent).toBe("false");
    expect(screen.getByTestId("test-label").textContent).toBe("idle");
    expect(screen.getByTestId("test-preview-index").textContent).toBe("0");
    expect(screen.getByTestId("test-preview-label").textContent).toBe(
      "Center tone",
    );

    const context = FakeAudioContext.instances[0]!;
    expect(context.oscillators).toHaveLength(2);
    expect(context.bufferSources).toHaveLength(1);
    expect(context.gains[1]?.gain.value).toBeLessThanOrEqual(0.05);
    expect(context.panners[1]?.pan.value).toBe(-0.8);
  });

  test("returns independent default audio test mode step objects", () => {
    const first = createDefaultAudioTestModeSteps();
    const second = createDefaultAudioTestModeSteps();

    expect(first).not.toBe(second);
    expect(first[0]).not.toBe(second[0]);
    expect(first[0]?.kind).toBe("tone");
    expect(second[0]?.kind).toBe("tone");

    if (first[0]?.kind === "tone" && second[0]?.kind === "tone") {
      expect(first[0].tone).not.toBe(second[0].tone);
      first[0].tone.gain = 1;
      expect(second[0].tone.gain).toBe(0.05);
    }
  });

  test("stops audio test mode and cancels active playback", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("AudioContext", FakeAudioContext);

    render(
      <AudioProvider>
        <AudioTestModeHarness />
      </AudioProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "run test mode" }).click();
    });
    await act(async () => {
      screen.getByRole("button", { name: "stop test mode" }).click();
      await vi.advanceTimersByTimeAsync(500);
    });

    const context = FakeAudioContext.instances[0]!;
    expect(screen.getByTestId("test-running").textContent).toBe("false");
    expect(screen.getByTestId("test-label").textContent).toBe("idle");
    expect(screen.getByTestId("test-preview-label").textContent).toBe(
      "Center tone",
    );
    expect(context.oscillators[0]?.stopCalls).toBeGreaterThan(0);
    expect(context.oscillators).toHaveLength(1);
    expect(context.bufferSources).toHaveLength(0);
  });

  test("useAudioTestMode.stop aborts the pending step delay without waiting for it", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("AudioContext", FakeAudioContext);

    render(
      <AudioProvider>
        <AudioTestModeHarness />
      </AudioProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "run test mode" }).click();
    });

    expect(screen.getByTestId("test-running").textContent).toBe("true");
    const oscillatorCountAfterStart =
      FakeAudioContext.instances[0]!.oscillators.length;
    expect(oscillatorCountAfterStart).toBe(1);

    await act(async () => {
      screen.getByRole("button", { name: "stop test mode" }).click();
    });

    expect(screen.getByTestId("test-running").textContent).toBe("false");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(FakeAudioContext.instances[0]!.oscillators.length).toBe(
      oscillatorCountAfterStart,
    );
    expect(screen.getByTestId("test-running").textContent).toBe("false");
  });

  test("restarting audio test mode does not let a stale run stop the replacement playback", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("AudioContext", DelayedFakeAudioContext);

    render(
      <AudioProvider>
        <RestartingAudioTestModeHarness />
      </AudioProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "restartable test mode" }).click();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(20);
      screen.getByRole("button", { name: "restartable test mode" }).click();
    });

    const context = FakeAudioContext.instances[0]!;
    expect(context.oscillators).toHaveLength(2);
    expect(context.oscillators[0]?.stopCalls).toBe(2);
    expect(context.oscillators[1]?.stopCalls).toBe(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(80);
    });

    expect(context.oscillators[1]?.stopCalls).toBe(1);
    expect(screen.getByTestId("restart-running").textContent).toBe("true");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(20);
    });

    expect(context.oscillators[1]?.stopCalls).toBe(2);
    expect(screen.getByTestId("restart-running").textContent).toBe("false");
  });

  test("resets audio test mode state when AudioContext creation fails", async () => {
    vi.stubGlobal("AudioContext", undefined);
    vi.stubGlobal("webkitAudioContext", undefined);

    render(
      <AudioProvider>
        <MissingAudioTestModeApiHarness />
      </AudioProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "run unavailable test mode" }).click();
    });

    expect(screen.getByTestId("test-mode-error").textContent).toContain(
      "Web Audio API is not available in this browser",
    );
    expect(screen.getByTestId("test-mode-running").textContent).toBe("false");
  });

  test("clears playback timers when stopped manually", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("AudioContext", FakeAudioContext);

    render(
      <AudioProvider>
        <TimedToneHarness />
      </AudioProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "play timed" }).click();
    });
    await act(async () => {
      screen.getByRole("button", { name: "stop timed" }).click();
      vi.advanceTimersByTime(50);
    });

    expect(screen.getByTestId("timed-playing").textContent).toBe("false");
    expect(FakeAudioContext.instances[0]?.oscillators[0]?.stopCalls).toBe(2);
  });

  test("stops active playback and closes the AudioContext on unmount", async () => {
    vi.stubGlobal("AudioContext", FakeAudioContext);

    const rendered = render(
      <AudioProvider>
        <Harness />
      </AudioProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "play tone" }).click();
    });
    rendered.unmount();

    expect(FakeAudioContext.instances[0]?.oscillators[0]?.stopCalls).toBe(1);
    expect(FakeAudioContext.instances[0]?.close).toHaveBeenCalledTimes(1);
    expect(FakeAudioContext.instances[0]?.state).toBe("closed");
  });

  test("rebuilds the AudioContext when the cached one was closed externally", async () => {
    vi.stubGlobal("AudioContext", FakeAudioContext);

    render(
      <AudioProvider>
        <Harness />
      </AudioProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "play tone" }).click();
    });

    expect(FakeAudioContext.instances).toHaveLength(1);
    expect(FakeAudioContext.instances[0]?.state).toBe("running");

    const firstContext = FakeAudioContext.instances[0]!;
    firstContext.state = "closed";

    await act(async () => {
      screen.getByRole("button", { name: "play tone" }).click();
    });

    expect(FakeAudioContext.instances).toHaveLength(2);
    expect(FakeAudioContext.instances[1]?.state).toBe("running");
    expect(FakeAudioContext.instances[1]?.oscillators.length).toBeGreaterThan(
      0,
    );
  });

  test("surfaces a clear play error when Web Audio is unavailable", async () => {
    vi.stubGlobal("AudioContext", undefined);
    vi.stubGlobal("webkitAudioContext", undefined);

    render(
      <AudioProvider>
        <MissingAudioApiHarness />
      </AudioProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "play unavailable" }).click();
    });

    expect(screen.getByTestId("play-error").textContent).toContain(
      "Web Audio API is not available in this browser",
    );
  });

  test("WaveformCanvas skips requestAnimationFrame when reduced motion is preferred", async () => {
    const context = createCanvasContext();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      context,
    );
    const requestRaf = vi.fn(() => 99);
    vi.stubGlobal("requestAnimationFrame", requestRaf);
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
    vi.stubGlobal("AudioContext", FakeAudioContext);

    render(
      <AudioProvider>
        <Harness />
        <WaveformCanvas data-testid="waveform-reduced" />
      </AudioProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "play tone" }).click();
    });

    expect(requestRaf).not.toHaveBeenCalled();
    expect(context.stroke).toHaveBeenCalled();
  });

  test('WaveformCanvas with motion="always" animates even under reduced motion', async () => {
    const context = createCanvasContext();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      context,
    );
    const requestRaf = vi.fn(() => 42);
    vi.stubGlobal("requestAnimationFrame", requestRaf);
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
    vi.stubGlobal("AudioContext", FakeAudioContext);

    render(
      <AudioProvider>
        <Harness />
        <WaveformCanvas data-testid="waveform-always" motion="always" />
      </AudioProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "play tone" }).click();
    });

    expect(requestRaf).toHaveBeenCalled();
  });

  test("SpectrumCanvas skips requestAnimationFrame when reduced motion is preferred", async () => {
    const context = createCanvasContext();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      context,
    );
    const requestRaf = vi.fn(() => 99);
    vi.stubGlobal("requestAnimationFrame", requestRaf);
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
    vi.stubGlobal("AudioContext", FakeAudioContext);

    render(
      <AudioProvider>
        <Harness />
        <SpectrumCanvas data-testid="spectrum-reduced" />
      </AudioProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "play tone" }).click();
    });

    expect(requestRaf).not.toHaveBeenCalled();
    expect(
      FakeAudioContext.instances[0]?.analysers[0]?.frequencyDataCalls ?? 0,
    ).toBeGreaterThan(0);
  });

  test("WaveformCanvas pauses requestAnimationFrame when the page is hidden", async () => {
    const context = createCanvasContext();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      context,
    );
    const cancelRaf = vi.fn();
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn(() => 7),
    );
    vi.stubGlobal("cancelAnimationFrame", cancelRaf);
    vi.stubGlobal("AudioContext", FakeAudioContext);

    const addSpy = vi.spyOn(document, "addEventListener");

    render(
      <AudioProvider>
        <Harness />
        <WaveformCanvas data-testid="waveform-visibility" />
      </AudioProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "play tone" }).click();
    });

    const visibilityCall = addSpy.mock.calls.find(
      ([type]) => type === "visibilitychange",
    );
    expect(visibilityCall).toBeDefined();
    const handler = visibilityCall![1] as () => void;

    const originalHidden = Object.getOwnPropertyDescriptor(document, "hidden");
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => true,
    });

    try {
      handler();
      expect(cancelRaf).toHaveBeenCalledWith(7);
    } finally {
      if (originalHidden) {
        Object.defineProperty(document, "hidden", originalHidden);
      } else {
        Object.defineProperty(document, "hidden", {
          configurable: true,
          get: () => false,
        });
      }
    }
  });

  test("SpectrumCanvas pauses requestAnimationFrame when the page is hidden", async () => {
    const context = createCanvasContext();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      context,
    );
    const cancelRaf = vi.fn();
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn(() => 11),
    );
    vi.stubGlobal("cancelAnimationFrame", cancelRaf);
    vi.stubGlobal("AudioContext", FakeAudioContext);

    const addSpy = vi.spyOn(document, "addEventListener");

    render(
      <AudioProvider>
        <Harness />
        <SpectrumCanvas data-testid="spectrum-visibility" />
      </AudioProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "play tone" }).click();
    });

    const visibilityCalls = addSpy.mock.calls.filter(
      ([type]) => type === "visibilitychange",
    );
    expect(visibilityCalls.length).toBeGreaterThan(0);

    const originalHidden = Object.getOwnPropertyDescriptor(document, "hidden");
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => true,
    });

    try {
      for (const [, handler] of visibilityCalls) {
        (handler as () => void)();
      }
      expect(cancelRaf).toHaveBeenCalledWith(11);
    } finally {
      if (originalHidden) {
        Object.defineProperty(document, "hidden", originalHidden);
      } else {
        Object.defineProperty(document, "hidden", {
          configurable: true,
          get: () => false,
        });
      }
    }
  });

  test("WaveformCanvas scales the backing buffer to devicePixelRatio", () => {
    const context = createCanvasContext();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      context,
    );
    vi.stubGlobal("devicePixelRatio", 2);

    render(
      <AudioProvider>
        <WaveformCanvas
          data-testid="waveform-hidpi"
          height={80}
          lineWidth={2}
          width={320}
        />
      </AudioProvider>,
    );

    const canvas = screen.getByTestId("waveform-hidpi") as HTMLCanvasElement;
    expect(canvas.width).toBe(640);
    expect(canvas.height).toBe(160);
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, 640, 160);
    expect(context.lineTo).toHaveBeenCalledWith(640, 80);
  });

  test("SpectrumCanvas scales the backing buffer and bar gap to devicePixelRatio", () => {
    const context = createCanvasContext();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      context,
    );
    vi.stubGlobal("devicePixelRatio", 2);

    render(
      <AudioProvider>
        <SpectrumCanvas
          barCount={8}
          data-testid="spectrum-hidpi"
          height={80}
          width={320}
        />
      </AudioProvider>,
    );

    const canvas = screen.getByTestId("spectrum-hidpi") as HTMLCanvasElement;
    expect(canvas.width).toBe(640);
    expect(canvas.height).toBe(160);
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, 640, 160);
    expect(context.fillRect).toHaveBeenCalledWith(0, 156, 76.5, 4);
  });

  test("WaveformCanvas renders an idle waveform before playback creates an analyser", () => {
    const context = createCanvasContext();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      context,
    );

    render(
      <AudioProvider>
        <WaveformCanvas
          backgroundColor="#111111"
          data-testid="waveform"
          height={80}
          lineWidth={3}
          strokeColor="#eeeeee"
          width={320}
        />
      </AudioProvider>,
    );

    const canvas = screen.getByTestId("waveform");
    expect(canvas.getAttribute("aria-label")).toBe("Waveform analyser");
    expect(canvas.getAttribute("height")).toBe("80");
    expect(canvas.getAttribute("width")).toBe("320");
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, 320, 80);
    expect(context.moveTo).toHaveBeenCalledWith(0, 40);
    expect(context.lineTo).toHaveBeenCalledWith(320, 40);
    expect(context.stroke).toHaveBeenCalled();
  });

  test("WaveformCanvas reads analyser data after playback starts", async () => {
    const context = createCanvasContext();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      context,
    );
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn(() => 1),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.stubGlobal("AudioContext", FakeAudioContext);

    render(
      <AudioProvider>
        <Harness />
        <WaveformCanvas data-testid="waveform" />
      </AudioProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "play tone" }).click();
    });

    expect(
      FakeAudioContext.instances[0]?.analysers[0]?.timeDomainCalls,
    ).toBeGreaterThan(0);
    expect(context.lineTo).toHaveBeenCalled();
  });

  test("SpectrumCanvas renders idle bars before playback creates an analyser", () => {
    const context = createCanvasContext();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      context,
    );

    render(
      <AudioProvider>
        <SpectrumCanvas
          backgroundColor="#111111"
          barColor="#eeeeee"
          barCount={8}
          data-testid="spectrum"
          height={80}
          width={320}
        />
      </AudioProvider>,
    );

    const canvas = screen.getByTestId("spectrum");
    expect(canvas.getAttribute("aria-label")).toBe("Spectrum analyser");
    expect(canvas.getAttribute("height")).toBe("80");
    expect(canvas.getAttribute("width")).toBe("320");
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, 320, 80);
    expect(context.fillRect).toHaveBeenCalledWith(0, 78, 38.25, 2);
  });

  test("SpectrumCanvas reads analyser frequency data after playback starts", async () => {
    const context = createCanvasContext();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      context,
    );
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn(() => 1),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.stubGlobal("AudioContext", FakeAudioContext);

    render(
      <AudioProvider>
        <Harness />
        <SpectrumCanvas data-testid="spectrum" />
      </AudioProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "play tone" }).click();
    });

    expect(
      FakeAudioContext.instances[0]?.analysers[0]?.frequencyDataCalls,
    ).toBeGreaterThan(0);
    expect(context.fillRect).toHaveBeenCalled();
  });
});
