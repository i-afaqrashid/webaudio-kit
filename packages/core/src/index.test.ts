import { describe, expect, test } from "vitest";
import {
  clampFrequency,
  dbToGain,
  gainToDb,
  playFrequencySweep,
  playTone,
} from "./index";

class FakeAudioParam {
  value: number;
  events: Array<{ method: string; value: number; time: number }> = [];

  constructor(value: number) {
    this.value = value;
  }

  setValueAtTime(value: number, time: number) {
    this.value = value;
    this.events.push({ method: "setValueAtTime", value, time });
    return this;
  }

  linearRampToValueAtTime(value: number, time: number) {
    this.value = value;
    this.events.push({ method: "linearRampToValueAtTime", value, time });
    return this;
  }

  cancelScheduledValues(time: number) {
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
  onended: (() => void) | null = null;

  start(time?: number) {
    this.startedAt = time;
  }

  stop(time?: number) {
    this.stoppedAt = time;
    this.onended?.();
  }
}

class FakeGainNode extends FakeAudioNode {
  gain = new FakeAudioParam(1);
}

class FakeStereoPannerNode extends FakeAudioNode {
  pan = new FakeAudioParam(0);
}

class FakeAudioContext {
  currentTime = 5;
  destination = new FakeAudioNode();
  oscillators: FakeOscillatorNode[] = [];
  gains: FakeGainNode[] = [];
  panners: FakeStereoPannerNode[] = [];

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

  createStereoPanner() {
    const panner = new FakeStereoPannerNode();
    this.panners.push(panner);
    return panner;
  }
}

describe("audio math helpers", () => {
  test("converts between decibels and linear gain", () => {
    expect(dbToGain(0)).toBeCloseTo(1);
    expect(dbToGain(-6)).toBeCloseTo(0.501187, 5);
    expect(gainToDb(0.5)).toBeCloseTo(-6.0206, 4);
  });

  test("treats zero and negative gain as silence", () => {
    expect(gainToDb(0)).toBe(Number.NEGATIVE_INFINITY);
    expect(gainToDb(-0.25)).toBe(Number.NEGATIVE_INFINITY);
  });

  test("clamps playable frequencies to the safe default range", () => {
    expect(clampFrequency(5)).toBe(20);
    expect(clampFrequency(440)).toBe(440);
    expect(clampFrequency(30_000)).toBe(20_000);
    expect(clampFrequency(Number.NaN)).toBe(20);
  });
});

describe("playTone", () => {
  test("creates a tone graph with safe defaults and an idempotent stop handle", () => {
    const context = new FakeAudioContext();
    const destination = new FakeAudioNode();

    const handle = playTone(
      context as unknown as AudioContext,
      { frequency: 440 },
      destination as unknown as AudioNode,
    );

    expect(context.oscillators).toHaveLength(1);
    expect(context.gains).toHaveLength(1);
    expect(context.panners).toHaveLength(1);
    expect(context.oscillators[0]?.type).toBe("sine");
    expect(context.oscillators[0]?.frequency.events).toContainEqual({
      method: "setValueAtTime",
      value: 440,
      time: 5,
    });
    expect(context.gains[0]?.gain.events).toContainEqual({
      method: "setValueAtTime",
      value: 0.2,
      time: 5,
    });
    expect(context.panners[0]?.pan.events).toContainEqual({
      method: "setValueAtTime",
      value: 0,
      time: 5,
    });
    expect(context.oscillators[0]?.startedAt).toBe(5);

    handle.stop();
    handle.stop();

    expect(context.oscillators[0]?.stoppedAt).toBe(5);
    expect(context.oscillators[0]?.disconnected).toBe(true);
    expect(context.gains[0]?.disconnected).toBe(true);
    expect(context.panners[0]?.disconnected).toBe(true);
  });

  test("schedules finite tones by duration", () => {
    const context = new FakeAudioContext();

    playTone(context as unknown as AudioContext, {
      frequency: 22_000,
      gain: 0.5,
      type: "square",
      pan: -0.75,
      durationMs: 250,
    });

    expect(context.oscillators[0]?.frequency.value).toBe(20_000);
    expect(context.oscillators[0]?.type).toBe("square");
    expect(context.gains[0]?.gain.value).toBe(0.5);
    expect(context.panners[0]?.pan.value).toBe(-0.75);
    expect(context.oscillators[0]?.stoppedAt).toBe(5.25);
  });
});

describe("playFrequencySweep", () => {
  test("ramps oscillator frequency from start to end and stops at duration", () => {
    const context = new FakeAudioContext();

    playFrequencySweep(context as unknown as AudioContext, {
      from: 250,
      to: 8000,
      durationMs: 1000,
    });

    expect(context.oscillators[0]?.frequency.events).toEqual([
      { method: "cancelScheduledValues", value: 440, time: 5 },
      { method: "setValueAtTime", value: 250, time: 5 },
      { method: "linearRampToValueAtTime", value: 8000, time: 6 },
    ]);
    expect(context.oscillators[0]?.startedAt).toBe(5);
    expect(context.oscillators[0]?.stoppedAt).toBe(6);
  });
});
