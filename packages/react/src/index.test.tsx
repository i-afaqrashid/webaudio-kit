import { act, cleanup, render, screen } from "@testing-library/react";
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

  constructor(value: number) {
    this.value = value;
  }

  setValueAtTime(value: number) {
    this.value = value;
    return this;
  }

  linearRampToValueAtTime(value: number) {
    this.value = value;
    return this;
  }

  cancelScheduledValues() {
    return this;
  }
}

class FakeAudioNode {
  connect(destination: unknown) {
    return destination;
  }

  disconnect() {}
}

class FakeOscillatorNode extends FakeAudioNode {
  frequency = new FakeAudioParam(440);
  type: OscillatorType = "sine";
  onended: (() => void) | null = null;

  start() {}

  stop() {
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
    return new FakeStereoPannerNode();
  }
}

afterEach(() => {
  cleanup();
  FakeAudioContext.instances = [];
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
      <button type="button" onClick={() => void volume.setGain(0.4)}>
        set volume
      </button>
    </div>
  );
}

describe("AudioProvider", () => {
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
  });
});
