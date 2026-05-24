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
  disconnectCalls = 0;
  throwOnDisconnect = false;

  connect(destination: unknown) {
    this.connections.push(destination);
    return destination;
  }

  disconnect() {
    this.disconnectCalls += 1;
    if (this.throwOnDisconnect) {
      throw new Error("disconnect failed");
    }

    this.disconnected = true;
  }
}

class FakeOscillatorNode extends FakeAudioNode {
  frequency = new FakeAudioParam(440);
  type: OscillatorType = "sine";
  startedAt?: number;
  stoppedAt?: number;
  stopCalls = 0;
  throwOnStop = false;
  onended: (() => void) | null = null;

  start(time?: number) {
    this.startedAt = time;
  }

  stop(time?: number) {
    this.stopCalls += 1;
    if (this.throwOnStop) {
      throw new Error("stop failed");
    }

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
    expect(dbToGain(6)).toBeCloseTo(1.995262, 5);
    expect(dbToGain(Number.NEGATIVE_INFINITY)).toBe(0);
    expect(gainToDb(1)).toBeCloseTo(0);
    expect(gainToDb(0.5)).toBeCloseTo(-6.0206, 4);
  });

  test("treats zero, negative, and non-finite gain as silence", () => {
    expect(gainToDb(0)).toBe(Number.NEGATIVE_INFINITY);
    expect(gainToDb(-0.25)).toBe(Number.NEGATIVE_INFINITY);
    expect(gainToDb(Number.NaN)).toBe(Number.NEGATIVE_INFINITY);
    expect(gainToDb(Number.POSITIVE_INFINITY)).toBe(Number.NEGATIVE_INFINITY);
  });

  test("clamps playable frequencies to the safe default range", () => {
    expect(clampFrequency(5)).toBe(20);
    expect(clampFrequency(440)).toBe(440);
    expect(clampFrequency(30_000)).toBe(20_000);
    expect(clampFrequency(Number.NaN)).toBe(20);
  });

  test("supports custom frequency ranges even when min and max are reversed", () => {
    expect(clampFrequency(50, 1000, 100)).toBe(100);
    expect(clampFrequency(440, 1000, 100)).toBe(440);
    expect(clampFrequency(2000, 1000, 100)).toBe(1000);
    expect(clampFrequency(Number.POSITIVE_INFINITY, 1000, 100)).toBe(100);
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
    expect(context.oscillators[0]?.connections).toEqual([context.gains[0]]);
    expect(context.gains[0]?.connections).toEqual([context.panners[0]]);
    expect(context.panners[0]?.connections).toEqual([destination]);
    expect(context.oscillators[0]?.startedAt).toBe(5);

    handle.stop();
    handle.stop();

    expect(context.oscillators[0]?.stoppedAt).toBe(5);
    expect(context.oscillators[0]?.stopCalls).toBe(1);
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

  test("normalizes unsafe gain and pan values before scheduling playback", () => {
    const context = new FakeAudioContext();

    playTone(context as unknown as AudioContext, {
      frequency: Number.NaN,
      gain: -1,
      pan: 5,
      type: "triangle",
    });

    expect(context.oscillators[0]?.type).toBe("triangle");
    expect(context.oscillators[0]?.frequency.value).toBe(20);
    expect(context.gains[0]?.gain.value).toBe(0);
    expect(context.panners[0]?.pan.value).toBe(1);
  });

  test("falls back to a gain-only graph when StereoPannerNode is unavailable", () => {
    const context = new FakeAudioContext();
    const destination = new FakeAudioNode();
    Object.defineProperty(context, "createStereoPanner", {
      value: undefined,
    });

    playTone(
      context as unknown as AudioContext,
      { frequency: 440, pan: -1 },
      destination as unknown as AudioNode,
    );

    expect(context.panners).toHaveLength(0);
    expect(context.oscillators[0]?.connections).toEqual([context.gains[0]]);
    expect(context.gains[0]?.connections).toEqual([destination]);
  });

  test("uses default gain and center pan for non-finite values", () => {
    const context = new FakeAudioContext();

    playTone(context as unknown as AudioContext, {
      frequency: 440,
      gain: Number.NaN,
      pan: Number.POSITIVE_INFINITY,
    });

    expect(context.gains[0]?.gain.value).toBe(0.2);
    expect(context.panners[0]?.pan.value).toBe(0);
  });

  test("rejects invalid finite tone durations", () => {
    const context = new FakeAudioContext();

    expect(() =>
      playTone(context as unknown as AudioContext, {
        frequency: 440,
        durationMs: 0,
      }),
    ).toThrow("durationMs must be a positive number");
    expect(() =>
      playTone(context as unknown as AudioContext, {
        frequency: 440,
        durationMs: Number.NaN,
      }),
    ).toThrow("durationMs must be a positive number");
  });

  test("cleans up the graph if manual stop throws", () => {
    const context = new FakeAudioContext();
    const handle = playTone(context as unknown as AudioContext, {
      frequency: 440,
    });
    context.oscillators[0]!.throwOnStop = true;

    expect(() => handle.stop()).not.toThrow();

    expect(context.oscillators[0]?.disconnected).toBe(true);
    expect(context.gains[0]?.disconnected).toBe(true);
    expect(context.panners[0]?.disconnected).toBe(true);
  });

  test("ignores disconnect failures during cleanup", () => {
    const context = new FakeAudioContext();
    const handle = playTone(context as unknown as AudioContext, {
      frequency: 440,
    });
    context.gains[0]!.throwOnDisconnect = true;

    expect(() => handle.stop()).not.toThrow();

    expect(context.oscillators[0]?.disconnected).toBe(true);
    expect(context.gains[0]?.disconnectCalls).toBe(1);
    expect(context.panners[0]?.disconnected).toBe(true);
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

  test("clamps sweep endpoints and applies playback graph options", () => {
    const context = new FakeAudioContext();

    playFrequencySweep(context as unknown as AudioContext, {
      from: 5,
      to: 30_000,
      durationMs: 500,
      gain: 0.05,
      pan: -2,
      type: "sawtooth",
    });

    expect(context.oscillators[0]?.type).toBe("sawtooth");
    expect(context.oscillators[0]?.frequency.events).toEqual([
      { method: "cancelScheduledValues", value: 440, time: 5 },
      { method: "setValueAtTime", value: 20, time: 5 },
      { method: "linearRampToValueAtTime", value: 20_000, time: 5.5 },
    ]);
    expect(context.gains[0]?.gain.value).toBe(0.05);
    expect(context.panners[0]?.pan.value).toBe(-1);
  });

  test("requires a positive finite sweep duration", () => {
    const context = new FakeAudioContext();

    expect(() =>
      playFrequencySweep(context as unknown as AudioContext, {
        from: 250,
        to: 8000,
        durationMs: -1,
      }),
    ).toThrow("durationMs must be a positive number");
    expect(() =>
      playFrequencySweep(context as unknown as AudioContext, {
        from: 250,
        to: 8000,
        durationMs: Number.POSITIVE_INFINITY,
      }),
    ).toThrow("durationMs must be a positive number");
  });
});
