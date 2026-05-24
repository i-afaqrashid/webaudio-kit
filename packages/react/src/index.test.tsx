import { act, cleanup, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import {
  AudioProvider,
  useAnalyser,
  useAudioContext,
  useFrequencySweep,
  useTone,
  useVolume,
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

class FakeGainNode extends FakeAudioNode {
  gain = new FakeAudioParam(1);
}

class FakeAnalyserNode extends FakeAudioNode {
  fftSize = 2048;

  getByteTimeDomainData(data: Uint8Array) {
    data.fill(128);
  }
}

class FakeStereoPannerNode extends FakeAudioNode {
  pan = new FakeAudioParam(0);
}

class FakeAudioContext {
  static instances: FakeAudioContext[] = [];

  currentTime = 0;
  destination = new FakeAudioNode();
  state: AudioContextState = "suspended";
  resume = vi.fn(async () => {
    this.state = "running";
  });
  close = vi.fn(async () => {
    this.state = "closed";
  });
  oscillators: FakeOscillatorNode[] = [];
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

  createGain() {
    const gain = new FakeGainNode();
    this.gains.push(gain);
    return gain;
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

afterEach(() => {
  cleanup();
  FakeAudioContext.instances = [];
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function Harness() {
  const audio = useAudioContext();
  const tone = useTone({ frequency: 440 });
  const sweep = useFrequencySweep({ from: 250, to: 8000, durationMs: 1000 });
  const volume = useVolume();
  const analyser = useAnalyser();

  return (
    <div>
      <span data-testid="context-ready">
        {String(Boolean(audio.audioContext))}
      </span>
      <span data-testid="tone-playing">{String(tone.isPlaying)}</span>
      <span data-testid="sweep-playing">{String(sweep.isPlaying)}</span>
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
      <button type="button" onClick={() => void volume.setGain(0.4)}>
        set volume
      </button>
      <button type="button" onClick={() => void volume.setGain(-1)}>
        mute volume
      </button>
      <button type="button" onClick={() => void volume.setGain(Number.NaN)}>
        reset bad volume
      </button>
    </div>
  );
}

function MissingProviderHarness() {
  useAudioContext();
  return null;
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
});
