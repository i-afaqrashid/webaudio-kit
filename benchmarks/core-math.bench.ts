import { bench, describe } from "vitest";
import {
  clampFrequency,
  dbToGain,
  frequencyToNoteName,
  gainToDb,
} from "@webaudio-kit/core";

const options = {
  time: 250,
  iterations: 8,
  warmupTime: 50,
  warmupIterations: 3,
};

const dbValues = Array.from(
  { length: 4096 },
  (_, index) => -96 + (index % 121),
);
const gainValues = Array.from(
  { length: 4096 },
  (_, index) => (index + 1) / 4096,
);
const frequencies = Array.from(
  { length: 4096 },
  (_, index) => index * 11 - 2000,
);

let sink = 0;

describe("core math helpers", () => {
  bench(
    "dbToGain: convert 4,096 dB values",
    () => {
      let total = 0;

      for (const value of dbValues) {
        total += dbToGain(value);
      }

      sink = total;
    },
    options,
  );

  bench(
    "gainToDb: convert 4,096 gain values",
    () => {
      let total = 0;

      for (const value of gainValues) {
        total += gainToDb(value);
      }

      sink = total;
    },
    options,
  );

  bench(
    "clampFrequency: normalize 4,096 playback frequencies",
    () => {
      let total = 0;

      for (const value of frequencies) {
        total += clampFrequency(value);
      }

      sink = total;
    },
    options,
  );

  bench(
    "audio control math: dB to gain to dB to clamped frequency",
    () => {
      let total = 0;

      for (let index = 0; index < dbValues.length; index += 1) {
        const gain = dbToGain(dbValues[index]);
        total += gainToDb(gain);
        total += clampFrequency(frequencies[index]);
      }

      sink = total;
    },
    options,
  );

  bench(
    "frequencyToNoteName: format 4,096 pitch labels",
    () => {
      let total = 0;

      for (const value of frequencies) {
        total += frequencyToNoteName(clampFrequency(value)).length;
      }

      sink = total;
    },
    options,
  );
});

void sink;
