import { bench, describe } from "vitest";
import {
  playFrequencySweep,
  playTone,
  type FrequencySweepOptions,
  type ToneOptions,
} from "@webaudio-kit/core";
import { BenchmarkAudioContext } from "./web-audio-fakes";

const options = {
  time: 250,
  iterations: 8,
  warmupTime: 50,
  warmupIterations: 3,
};

const waveforms: OscillatorType[] = ["sine", "square", "sawtooth", "triangle"];
const tones: ToneOptions[] = Array.from({ length: 256 }, (_, index) => ({
  frequency: 110 + index * 31,
  gain: 0.05 + (index % 20) / 100,
  pan: -1 + (index % 200) / 100,
  type: waveforms[index % waveforms.length],
}));
const timedTones: ToneOptions[] = tones.map((tone, index) => ({
  ...tone,
  durationMs: 25 + (index % 40),
}));
const sweeps: FrequencySweepOptions[] = Array.from(
  { length: 128 },
  (_, index) => ({
    from: 80 + index * 7,
    to: 8000 - index * 13,
    durationMs: 120 + (index % 80),
    gain: 0.08 + (index % 12) / 100,
    pan: -0.5 + (index % 100) / 100,
    type: waveforms[index % waveforms.length],
  }),
);

let sink = 0;

describe("core playback scheduling", () => {
  bench(
    "playTone: create, schedule, stop, and clean up 256 tones",
    () => {
      const context = new BenchmarkAudioContext();
      let count = 0;

      for (const tone of tones) {
        const handle = playTone(context as unknown as AudioContext, tone);
        handle.stop();
        context.currentTime += 0.001;
        count += 1;
      }

      sink = count;
    },
    options,
  );

  bench(
    "playTone: schedule 256 finite-duration tones",
    () => {
      const context = new BenchmarkAudioContext();
      let count = 0;

      for (const tone of timedTones) {
        playTone(context as unknown as AudioContext, tone);
        context.currentTime += 0.001;
        count += 1;
      }

      sink = count;
    },
    options,
  );

  bench(
    "playFrequencySweep: schedule 128 sweep ramps",
    () => {
      const context = new BenchmarkAudioContext();
      let count = 0;

      for (const sweep of sweeps) {
        playFrequencySweep(context as unknown as AudioContext, sweep);
        context.currentTime += 0.002;
        count += 1;
      }

      sink = count;
    },
    options,
  );

  bench(
    "mixed playback: interleave tone and sweep graph setup",
    () => {
      const context = new BenchmarkAudioContext();
      let count = 0;

      for (let index = 0; index < tones.length; index += 1) {
        const handle = playTone(
          context as unknown as AudioContext,
          tones[index],
        );
        handle.stop();

        if (index < sweeps.length) {
          playFrequencySweep(context as unknown as AudioContext, sweeps[index]);
        }

        context.currentTime += 0.002;
        count += 1;
      }

      sink = count;
    },
    options,
  );
});

void sink;
