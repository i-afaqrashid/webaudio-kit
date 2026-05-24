import { bench, describe } from "vitest";
import { BenchmarkAnalyserNode } from "./web-audio-fakes";

const options = {
  time: 250,
  iterations: 8,
  warmupTime: 50,
  warmupIterations: 3,
};

const analyser = new BenchmarkAnalyserNode();
const frame = new Uint8Array(analyser.fftSize);
const width = 720;
const height = 180;

let sink = 0;

describe("analyser frame processing", () => {
  bench(
    "getByteTimeDomainData: fill 120 analyser frames",
    () => {
      let total = 0;

      for (let index = 0; index < 120; index += 1) {
        analyser.getByteTimeDomainData(frame);
        total += frame[index % frame.length];
      }

      sink = total;
    },
    options,
  );

  bench(
    "waveform geometry: convert 2,048 samples to canvas coordinates",
    () => {
      analyser.getByteTimeDomainData(frame);
      sink = waveformChecksum(frame, width, height);
    },
    options,
  );

  bench(
    "waveform render loop: read and transform 120 frames",
    () => {
      let total = 0;

      for (let index = 0; index < 120; index += 1) {
        analyser.getByteTimeDomainData(frame);
        total += waveformChecksum(frame, width, height);
      }

      sink = total;
    },
    options,
  );
});

function waveformChecksum(
  data: Uint8Array,
  canvasWidth: number,
  canvasHeight: number,
) {
  const slice = canvasWidth / data.length;
  let checksum = 0;

  for (let index = 0; index < data.length; index += 1) {
    const x = index * slice;
    const y = (data[index] / 255) * canvasHeight;
    checksum += x * 0.001 + y;
  }

  return checksum;
}

void sink;
