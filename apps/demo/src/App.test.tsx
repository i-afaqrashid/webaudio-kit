import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { AudioProvider } from "@webaudio-kit/react";
import App from "./App";

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
  frequencyBinCount = 1024;

  getByteFrequencyData(data: Uint8Array) {
    data.fill(0);
  }

  getByteTimeDomainData(data: Uint8Array) {
    data.fill(128);
  }
}

class FakeStereoPannerNode extends FakeAudioNode {
  pan = new FakeAudioParam(0);
}

class FakeAudioContext {
  currentTime = 0;
  destination = new FakeAudioNode();
  state: AudioContextState = "suspended";
  resume = vi.fn(async () => {
    this.state = "running";
  });
  close = vi.fn(async () => {
    this.state = "closed";
  });

  createOscillator() {
    return new FakeOscillatorNode();
  }

  createGain() {
    return new FakeGainNode();
  }

  createAnalyser() {
    return new FakeAnalyserNode();
  }

  createStereoPanner() {
    return new FakeStereoPannerNode();
  }
}

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    () =>
      ({
        beginPath: vi.fn(),
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        lineTo: vi.fn(),
        moveTo: vi.fn(),
        stroke: vi.fn(),
        fillStyle: "",
        lineWidth: 1,
        strokeStyle: "",
      }) as unknown as CanvasRenderingContext2D,
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function renderDemo() {
  return render(
    <AudioProvider>
      <App />
    </AudioProvider>,
  );
}

describe("demo app", () => {
  test("renders the MVP controls and safety disclaimer", () => {
    renderDemo();

    expect(
      screen.getByRole("heading", {
        name: "Build browser audio interfaces without fighting AudioContext.",
      }),
    ).toBeTruthy();
    expect(screen.getByText("Tone generator")).toBeTruthy();
    expect(screen.getByText("Frequency sweep")).toBeTruthy();
    expect(screen.getByText("Analyser")).toBeTruthy();
    expect(screen.getByLabelText("Spectrum analyser")).toBeTruthy();
    expect(
      screen.getByText(
        "webaudio-kit is for browser audio interfaces and prototypes. It is not a certified audiology or medical testing system.",
      ),
    ).toBeTruthy();
  });

  test("updates tone controls from user input", () => {
    renderDemo();

    fireEvent.change(screen.getByLabelText("Frequency"), {
      target: { value: "880" },
    });
    fireEvent.change(screen.getByLabelText(/Gain/), {
      target: { value: "-18" },
    });
    fireEvent.change(screen.getByLabelText("Pan"), {
      target: { value: "0.4" },
    });
    fireEvent.click(screen.getByRole("button", { name: "square" }));

    expect(screen.getByText("880 Hz")).toBeTruthy();
    expect(screen.getByText("-18 dB / gain 0.126 / -18.0 dB")).toBeTruthy();
    expect(screen.getByLabelText("Pan")).toHaveProperty("value", "0.4");
    expect(screen.getByRole("button", { name: "square" }).className).toContain(
      "active",
    );
  });

  test("plays and stops tone and sweep through the demo controls", async () => {
    vi.stubGlobal("AudioContext", FakeAudioContext);
    renderDemo();

    await act(async () => {
      screen.getByRole("button", { name: "Play tone" }).click();
    });
    expect(screen.getByRole("button", { name: "Restart tone" })).toBeTruthy();
    expect(screen.getByText("live")).toBeTruthy();

    await act(async () => {
      screen.getAllByRole("button", { name: "Stop" })[0]!.click();
    });
    expect(screen.getByRole("button", { name: "Play tone" })).toBeTruthy();

    await act(async () => {
      screen.getByRole("button", { name: "Run sweep" }).click();
    });
    expect(screen.getByRole("button", { name: "Restart sweep" })).toBeTruthy();

    await act(async () => {
      screen.getAllByRole("button", { name: "Stop" })[1]!.click();
    });
    expect(screen.getByRole("button", { name: "Run sweep" })).toBeTruthy();
  });
});
