import { afterEach, describe, expect, test, vi } from "vitest";
import {
  clampFrequency,
  dbToGain,
  frequencyToMidi,
  frequencyToNoteName,
  gainToDb,
  midiToFrequency,
  playFrequencySweep,
  playNoise,
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
  detune = new FakeAudioParam(0);
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
    if (time === undefined || time <= 5) {
      this.onended?.();
    }
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

class FakeBiquadFilterNode extends FakeAudioNode {
  frequency = new FakeAudioParam(350);
  Q = new FakeAudioParam(1);
  type: BiquadFilterType = "lowpass";
}

class FakeAudioContext {
  currentTime = 5;
  sampleRate = 48_000;
  destination = new FakeAudioNode();
  oscillators: FakeOscillatorNode[] = [];
  bufferSources: FakeAudioBufferSourceNode[] = [];
  buffers: FakeAudioBuffer[] = [];
  filters: FakeBiquadFilterNode[] = [];
  gains: FakeGainNode[] = [];
  panners: FakeStereoPannerNode[] = [];

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

  createStereoPanner() {
    const panner = new FakeStereoPannerNode();
    this.panners.push(panner);
    return panner;
  }
}

afterEach(() => {
  vi.restoreAllMocks();
});

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

  test("converts MIDI note numbers and frequencies", () => {
    expect(midiToFrequency(69)).toBeCloseTo(440);
    expect(midiToFrequency(60)).toBeCloseTo(261.625565, 5);
    expect(frequencyToMidi(440)).toBeCloseTo(69);
    expect(frequencyToMidi(261.625565)).toBeCloseTo(60, 4);
  });

  test("formats nearest note names with optional cent offsets", () => {
    expect(frequencyToNoteName(440)).toBe("A4");
    expect(frequencyToNoteName(261.625565)).toBe("C4");
    expect(frequencyToNoteName(445, { includeCents: true })).toBe("A4 +20c");
    expect(frequencyToNoteName(435, { includeCents: true })).toBe("A4 -20c");
  });

  test("returns NaN or unknown note names for invalid pitch inputs", () => {
    expect(midiToFrequency(Number.NaN)).toBeNaN();
    expect(frequencyToMidi(0)).toBeNaN();
    expect(frequencyToMidi(Number.POSITIVE_INFINITY)).toBeNaN();
    expect(frequencyToNoteName(-1)).toBe("unknown");
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

  test("schedules tone gain with an ADSR envelope", () => {
    const context = new FakeAudioContext();

    playTone(context as unknown as AudioContext, {
      frequency: 440,
      gain: 0.5,
      durationMs: 1000,
      envelope: { attackMs: 20, decayMs: 80, sustain: 0.4, releaseMs: 120 },
    });

    expect(context.gains[0]?.gain.events).toEqual([
      { method: "cancelScheduledValues", value: 1, time: 5 },
      { method: "setValueAtTime", value: 0, time: 5 },
      { method: "linearRampToValueAtTime", value: 0.5, time: 5.02 },
      { method: "linearRampToValueAtTime", value: 0.2, time: 5.1 },
      { method: "setValueAtTime", value: 0.2, time: 5.88 },
      { method: "linearRampToValueAtTime", value: 0, time: 6 },
    ]);
  });

  test("routes tones through a filter and schedules oscillator detune", () => {
    const context = new FakeAudioContext();
    const destination = new FakeAudioNode();

    playTone(
      context as unknown as AudioContext,
      {
        frequency: 440,
        detuneCents: -12,
        filter: { frequency: 1200, q: 0.7 },
      },
      destination as unknown as AudioNode,
    );

    expect(context.filters).toHaveLength(1);
    expect(context.oscillators[0]?.detune.events).toContainEqual({
      method: "setValueAtTime",
      value: -12,
      time: 5,
    });
    expect(context.filters[0]?.type).toBe("lowpass");
    expect(context.filters[0]?.frequency.events).toContainEqual({
      method: "setValueAtTime",
      value: 1200,
      time: 5,
    });
    expect(context.filters[0]?.Q.events).toContainEqual({
      method: "setValueAtTime",
      value: 0.7,
      time: 5,
    });
    expect(context.oscillators[0]?.connections).toEqual([context.gains[0]]);
    expect(context.gains[0]?.connections).toEqual([context.filters[0]]);
    expect(context.filters[0]?.connections).toEqual([context.panners[0]]);
    expect(context.panners[0]?.connections).toEqual([destination]);
  });

  test("creates detuned multi-voice tones with shared requested gain", () => {
    const context = new FakeAudioContext();

    const handle = playTone(context as unknown as AudioContext, {
      frequency: 440,
      gain: 0.3,
      durationMs: 200,
      voices: { count: 3, spreadCents: 12 },
    });

    expect(context.oscillators).toHaveLength(3);
    expect(context.gains[0]?.gain.value).toBeCloseTo(0.1);
    expect(context.gains[1]?.gain.value).toBeCloseTo(0.1);
    expect(context.gains[2]?.gain.value).toBeCloseTo(0.1);
    expect(
      context.oscillators.map((oscillator) => oscillator.detune.value),
    ).toEqual([-6, 0, 6]);
    expect(
      context.oscillators.map((oscillator) => oscillator.startedAt),
    ).toEqual([5, 5, 5]);
    expect(
      context.oscillators.map((oscillator) => oscillator.stoppedAt),
    ).toEqual([5.2, 5.2, 5.2]);

    handle.stop();
    handle.stop();

    expect(
      context.oscillators.map((oscillator) => oscillator.stopCalls),
    ).toEqual([2, 2, 2]);
  });

  test("manual stop uses envelope release before stopping indefinite tones", () => {
    const context = new FakeAudioContext();

    const handle = playTone(context as unknown as AudioContext, {
      frequency: 440,
      gain: 0.4,
      envelope: { attackMs: 10, releaseMs: 50 },
    });

    handle.stop();

    expect(context.oscillators[0]?.stoppedAt).toBeCloseTo(5.05);
    expect(context.gains[0]?.gain.events).toContainEqual({
      method: "linearRampToValueAtTime",
      value: 0,
      time: 5.05,
    });
  });

  test("schedules repeat patterns with duration and gap spacing", () => {
    const context = new FakeAudioContext();

    playTone(context as unknown as AudioContext, {
      frequency: 880,
      durationMs: 250,
      pattern: { repeat: 3, gapMs: 100 },
    });

    expect(context.oscillators).toHaveLength(3);
    expect(
      context.oscillators.map((oscillator) => oscillator.startedAt),
    ).toEqual([5, 5.35, 5.7]);
    expect(
      context.oscillators.map((oscillator) => oscillator.stoppedAt),
    ).toEqual([5.25, 5.6, 5.95]);
    expect(
      context.oscillators.map((oscillator) => oscillator.frequency.value),
    ).toEqual([880, 880, 880]);
  });

  test("stops every voice in a scheduled tone pattern", () => {
    const context = new FakeAudioContext();

    const handle = playTone(context as unknown as AudioContext, {
      frequency: 440,
      durationMs: 200,
      pattern: { repeat: 2, gapMs: 100 },
    });

    handle.stop();
    handle.stop();

    expect(context.oscillators).toHaveLength(2);
    expect(context.oscillators[0]?.stopCalls).toBe(2);
    expect(context.oscillators[1]?.stopCalls).toBe(2);
    expect(context.oscillators[0]?.disconnected).toBe(true);
    expect(context.oscillators[1]?.disconnected).toBe(true);
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

  test("rejects invalid envelope values", () => {
    const context = new FakeAudioContext();

    expect(() =>
      playTone(context as unknown as AudioContext, {
        frequency: 440,
        envelope: { attackMs: -1 },
      }),
    ).toThrow("envelope.attackMs must be a non-negative number");
    expect(() =>
      playTone(context as unknown as AudioContext, {
        frequency: 440,
        envelope: { sustain: 1.2 },
      }),
    ).toThrow("envelope.sustain must be between 0 and 1");
    expect(() =>
      playTone(context as unknown as AudioContext, {
        frequency: 440,
        envelope: { releaseMs: Number.POSITIVE_INFINITY },
      }),
    ).toThrow("envelope.releaseMs must be a non-negative number");
  });

  test("rejects invalid filter and voice values", () => {
    const context = new FakeAudioContext();

    expect(() =>
      playTone(context as unknown as AudioContext, {
        frequency: 440,
        filter: { frequency: -1 },
      }),
    ).toThrow("filter.frequency must be a positive number");
    expect(() =>
      playTone(context as unknown as AudioContext, {
        frequency: 440,
        filter: { frequency: 1000, q: -1 },
      }),
    ).toThrow("filter.q must be a non-negative number");
    expect(() =>
      playTone(context as unknown as AudioContext, {
        frequency: 440,
        voices: { count: 0 },
      }),
    ).toThrow("voices.count must be an integer between 1 and 8");
    expect(() =>
      playTone(context as unknown as AudioContext, {
        frequency: 440,
        voices: { count: 2, spreadCents: Number.NaN },
      }),
    ).toThrow("voices.spreadCents must be a finite number");
  });

  test("requires finite tone durations and valid spacing for repeat patterns", () => {
    const context = new FakeAudioContext();

    expect(() =>
      playTone(context as unknown as AudioContext, {
        frequency: 440,
        pattern: { repeat: 2 },
      }),
    ).toThrow("durationMs must be a positive number");
    expect(() =>
      playTone(context as unknown as AudioContext, {
        frequency: 440,
        durationMs: 100,
        pattern: { repeat: 0 },
      }),
    ).toThrow("pattern.repeat must be a positive integer");
    expect(() =>
      playTone(context as unknown as AudioContext, {
        frequency: 440,
        durationMs: 100,
        pattern: { repeat: 2, gapMs: -1 },
      }),
    ).toThrow("pattern.gapMs must be a non-negative number");
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

  test("schedules repeat sweep patterns with independent ramps", () => {
    const context = new FakeAudioContext();

    playFrequencySweep(context as unknown as AudioContext, {
      from: 250,
      to: 8000,
      durationMs: 500,
      pattern: { repeat: 2, gapMs: 200 },
    });

    expect(context.oscillators).toHaveLength(2);
    expect(context.oscillators[0]?.startedAt).toBe(5);
    expect(context.oscillators[0]?.stoppedAt).toBe(5.5);
    expect(context.oscillators[0]?.frequency.events).toEqual([
      { method: "cancelScheduledValues", value: 440, time: 5 },
      { method: "setValueAtTime", value: 250, time: 5 },
      { method: "linearRampToValueAtTime", value: 8000, time: 5.5 },
    ]);
    expect(context.oscillators[1]?.startedAt).toBe(5.7);
    expect(context.oscillators[1]?.stoppedAt).toBe(6.2);
    expect(context.oscillators[1]?.frequency.events).toEqual([
      { method: "cancelScheduledValues", value: 440, time: 5.7 },
      { method: "setValueAtTime", value: 250, time: 5.7 },
      { method: "linearRampToValueAtTime", value: 8000, time: 6.2 },
    ]);
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

describe("playNoise", () => {
  test("creates a timed white-noise graph with safe defaults", () => {
    const context = new FakeAudioContext();
    const destination = new FakeAudioNode();

    playNoise(
      context as unknown as AudioContext,
      { durationMs: 250 },
      destination as unknown as AudioNode,
    );

    expect(context.bufferSources).toHaveLength(1);
    expect(context.buffers).toHaveLength(1);
    expect(context.gains).toHaveLength(1);
    expect(context.panners).toHaveLength(1);
    expect(context.buffers[0]?.length).toBe(12_000);
    expect(context.buffers[0]?.sampleRate).toBe(48_000);
    expect(context.bufferSources[0]?.buffer).toBe(context.buffers[0]);
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
    expect(context.bufferSources[0]?.connections).toEqual([context.gains[0]]);
    expect(context.gains[0]?.connections).toEqual([context.panners[0]]);
    expect(context.panners[0]?.connections).toEqual([destination]);
    expect(context.bufferSources[0]?.startedAt).toBe(5);
    expect(context.bufferSources[0]?.stoppedAt).toBe(5.25);

    const samples = Array.from(context.buffers[0]!.getChannelData(0));
    expect(samples.some((sample) => sample !== 0)).toBe(true);
    expect(Math.max(...samples)).toBeLessThanOrEqual(1);
    expect(Math.min(...samples)).toBeGreaterThanOrEqual(-1);
  });

  test("schedules repeat noise patterns with duration and gap spacing", () => {
    const context = new FakeAudioContext();

    playNoise(context as unknown as AudioContext, {
      durationMs: 300,
      pattern: { repeat: 2, gapMs: 50 },
      type: "pink",
    });

    expect(context.bufferSources).toHaveLength(2);
    expect(context.bufferSources.map((source) => source.startedAt)).toEqual([
      5, 5.35,
    ]);
    expect(context.bufferSources[0]?.stoppedAt).toBeCloseTo(5.3);
    expect(context.bufferSources[1]?.stoppedAt).toBeCloseTo(5.65);
    expect(context.buffers).toHaveLength(1);
    expect(context.buffers[0]?.length).toBe(14_400);
    expect(context.bufferSources[0]?.buffer).toBe(context.buffers[0]);
    expect(context.bufferSources[1]?.buffer).toBe(context.buffers[0]);
  });

  test("schedules noise gain with attack and release envelope", () => {
    const context = new FakeAudioContext();

    playNoise(context as unknown as AudioContext, {
      durationMs: 500,
      gain: 0.1,
      envelope: { attackMs: 10, releaseMs: 80 },
    });

    expect(context.gains[0]?.gain.events).toEqual([
      { method: "cancelScheduledValues", value: 1, time: 5 },
      { method: "setValueAtTime", value: 0, time: 5 },
      { method: "linearRampToValueAtTime", value: 0.1, time: 5.01 },
      { method: "setValueAtTime", value: 0.1, time: 5.42 },
      { method: "linearRampToValueAtTime", value: 0, time: 5.5 },
    ]);
  });

  test("supports pink and brown noise buffers with graph options", () => {
    const context = new FakeAudioContext();

    playNoise(context as unknown as AudioContext, {
      durationMs: 100,
      gain: 0.05,
      pan: -2,
      type: "pink",
    });
    playNoise(context as unknown as AudioContext, {
      durationMs: 100,
      gain: 0.08,
      pan: 2,
      type: "brown",
    });

    expect(context.gains[0]?.gain.value).toBe(0.05);
    expect(context.panners[0]?.pan.value).toBe(-1);
    expect(context.gains[1]?.gain.value).toBe(0.08);
    expect(context.panners[1]?.pan.value).toBe(1);

    for (const buffer of context.buffers) {
      const samples = Array.from(buffer.getChannelData(0));
      expect(samples.some((sample) => sample !== 0)).toBe(true);
      expect(Math.max(...samples)).toBeLessThanOrEqual(1);
      expect(Math.min(...samples)).toBeGreaterThanOrEqual(-1);
    }
  });

  test("requires a positive finite noise duration", () => {
    const context = new FakeAudioContext();

    expect(() =>
      playNoise(context as unknown as AudioContext, { durationMs: 0 }),
    ).toThrow("durationMs must be a positive number");
    expect(() =>
      playNoise(context as unknown as AudioContext, {
        durationMs: Number.NaN,
      }),
    ).toThrow("durationMs must be a positive number");
  });

  test("caches generated noise buffers per (type, sampleRate, duration bucket)", () => {
    const context = new FakeAudioContext();

    playNoise(context as unknown as AudioContext, {
      durationMs: 200,
      type: "pink",
    });
    playNoise(context as unknown as AudioContext, {
      durationMs: 200,
      type: "pink",
    });
    playNoise(context as unknown as AudioContext, {
      durationMs: 200,
      type: "white",
    });
    playNoise(context as unknown as AudioContext, {
      durationMs: 320,
      type: "pink",
    });

    expect(context.bufferSources).toHaveLength(4);
    expect(context.buffers).toHaveLength(3);
    expect(context.bufferSources[0]?.buffer).toBe(
      context.bufferSources[1]?.buffer,
    );
    expect(context.bufferSources[0]?.buffer).not.toBe(
      context.bufferSources[2]?.buffer,
    );
    expect(context.bufferSources[0]?.buffer).not.toBe(
      context.bufferSources[3]?.buffer,
    );
  });

  test("rounds noise durations up to the cache bucket so playback length is preserved", () => {
    const context = new FakeAudioContext();

    playNoise(context as unknown as AudioContext, {
      durationMs: 174,
      type: "white",
    });

    expect(context.buffers).toHaveLength(1);
    expect(context.buffers[0]?.length).toBe(9_600);
    expect(context.bufferSources[0]?.stoppedAt).toBeCloseTo(5.174);
  });

  test("cleans up the noise graph if manual stop throws", () => {
    const context = new FakeAudioContext();
    const handle = playNoise(context as unknown as AudioContext, {
      durationMs: 250,
    });
    context.bufferSources[0]!.throwOnStop = true;
    context.bufferSources[0]!.onended = null;

    expect(() => handle.stop()).not.toThrow();

    expect(context.bufferSources[0]?.disconnected).toBe(true);
    expect(context.gains[0]?.disconnected).toBe(true);
    expect(context.panners[0]?.disconnected).toBe(true);
  });
});
