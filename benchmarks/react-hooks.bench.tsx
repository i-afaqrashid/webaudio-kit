import { act, cleanup, render } from "@testing-library/react";
import { afterAll, beforeAll, bench, describe } from "vitest";
import {
  AudioProvider,
  useFrequencySweep,
  useNoise,
  useTone,
  useVolume,
} from "@webaudio-kit/react";
import { installBenchmarkAudioContext } from "./web-audio-fakes";

const options = {
  time: 250,
  iterations: 8,
  warmupTime: 50,
  warmupIterations: 3,
};

type Controls = {
  playSweep(): Promise<void>;
  playNoise(): Promise<void>;
  playTone(): Promise<void>;
  setGain(value: number): Promise<void>;
  stopNoise(): void;
  stopSweep(): void;
  stopTone(): void;
};

let restoreAudioContext: (() => void) | undefined;
let sink = 0;

beforeAll(() => {
  restoreAudioContext = installBenchmarkAudioContext();
});

afterAll(() => {
  cleanup();
  restoreAudioContext?.();
});

describe("react audio hooks", () => {
  bench(
    "AudioProvider + hooks: render control surface",
    () => {
      const rendered = render(
        <AudioProvider>
          <BenchmarkControls onReady={() => undefined} />
        </AudioProvider>,
      );

      sink += 1;
      rendered.unmount();
      cleanup();
    },
    options,
  );

  bench(
    "useTone/useFrequencySweep/useNoise/useVolume: play, stop, and update gain",
    async () => {
      let controls: Controls | undefined;
      const rendered = render(
        <AudioProvider>
          <BenchmarkControls
            onReady={(nextControls) => {
              controls = nextControls;
            }}
          />
        </AudioProvider>,
      );

      if (!controls) {
        throw new Error("Benchmark controls did not initialize");
      }

      const readyControls = controls;
      await act(async () => {
        await readyControls.playTone();
        readyControls.stopTone();
        await readyControls.setGain(0.35);
        await readyControls.playSweep();
        readyControls.stopSweep();
        await readyControls.playNoise();
        readyControls.stopNoise();
      });

      sink += 1;
      rendered.unmount();
      cleanup();
    },
    options,
  );
});

function BenchmarkControls({ onReady }: { onReady(controls: Controls): void }) {
  const tone = useTone({
    frequency: 440,
    gain: 0.1,
    pan: -0.1,
    type: "sine",
  });
  const sweep = useFrequencySweep({
    from: 250,
    to: 8000,
    durationMs: 250,
    gain: 0.1,
    pan: 0.1,
    type: "sine",
  });
  const volume = useVolume();
  const noise = useNoise({
    durationMs: 80,
    gain: 0.08,
    pan: 0,
    type: "pink",
  });

  onReady({
    playNoise: noise.play,
    playSweep: sweep.play,
    playTone: tone.play,
    setGain: volume.setGain,
    stopNoise: noise.stop,
    stopSweep: sweep.stop,
    stopTone: tone.stop,
  });

  return null;
}

void sink;
