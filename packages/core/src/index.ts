export type ToneOptions = {
  frequency: number;
  gain?: number;
  type?: OscillatorType;
  pan?: number;
  durationMs?: number;
  envelope?: PlaybackEnvelope;
  pattern?: PlaybackPattern;
};

export type FrequencySweepOptions = {
  from: number;
  to: number;
  durationMs: number;
  gain?: number;
  type?: OscillatorType;
  pan?: number;
  envelope?: PlaybackEnvelope;
  pattern?: PlaybackPattern;
};

export type NoiseType = "white" | "pink" | "brown";

export type NoiseOptions = {
  durationMs: number;
  gain?: number;
  pan?: number;
  type?: NoiseType;
  envelope?: PlaybackEnvelope;
  pattern?: PlaybackPattern;
};

export type PlaybackHandle = {
  stop(): void;
};

export type PlaybackEnvelope = {
  attackMs?: number;
  decayMs?: number;
  sustain?: number;
  releaseMs?: number;
};

export type PlaybackPattern = {
  repeat?: number;
  gapMs?: number;
};

export type NoteNameOptions = {
  concertA?: number;
  includeCents?: boolean;
};

export const DEFAULT_GAIN = 0.2;
export const DEFAULT_MIN_FREQUENCY = 20;
export const DEFAULT_MAX_FREQUENCY = 20_000;
export const DEFAULT_CONCERT_A = 440;

const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export function dbToGain(db: number): number {
  return 10 ** (db / 20);
}

export function gainToDb(gain: number): number {
  if (!Number.isFinite(gain) || gain <= 0) {
    return Number.NEGATIVE_INFINITY;
  }

  return 20 * Math.log10(gain);
}

export function clampFrequency(
  value: number,
  min = DEFAULT_MIN_FREQUENCY,
  max = DEFAULT_MAX_FREQUENCY,
): number {
  const low = Math.min(min, max);
  const high = Math.max(min, max);

  if (!Number.isFinite(value)) {
    return low;
  }

  return Math.min(high, Math.max(low, value));
}

export function midiToFrequency(
  midiNote: number,
  concertA = DEFAULT_CONCERT_A,
): number {
  if (!Number.isFinite(midiNote) || !isPositiveFinite(concertA)) {
    return Number.NaN;
  }

  return concertA * 2 ** ((midiNote - 69) / 12);
}

export function frequencyToMidi(
  frequency: number,
  concertA = DEFAULT_CONCERT_A,
): number {
  if (!isPositiveFinite(frequency) || !isPositiveFinite(concertA)) {
    return Number.NaN;
  }

  return 69 + 12 * Math.log2(frequency / concertA);
}

export function frequencyToNoteName(
  frequency: number,
  options: NoteNameOptions = {},
): string {
  const midi = frequencyToMidi(frequency, options.concertA);
  if (!Number.isFinite(midi)) {
    return "unknown";
  }

  const roundedMidi = Math.round(midi);
  const noteName = NOTE_NAMES[positiveModulo(roundedMidi, 12)]!;
  const octave = Math.floor(roundedMidi / 12) - 1;
  const base = `${noteName}${octave}`;

  if (!options.includeCents) {
    return base;
  }

  const cents = Math.round((midi - roundedMidi) * 100);
  if (cents === 0) {
    return base;
  }

  return `${base} ${cents > 0 ? "+" : ""}${cents}c`;
}

export function playTone(
  context: AudioContext,
  options: ToneOptions,
  destination: AudioNode = context.destination,
): PlaybackHandle {
  const pattern = normalizePlaybackPattern(options.pattern);

  if (pattern.repeat > 1) {
    const durationSeconds = durationToSeconds(options.durationMs, true);

    return createPatternPlaybackHandle(
      context,
      pattern,
      durationSeconds,
      (at) => playToneAt(context, options, destination, at, durationSeconds),
    );
  }

  const durationSeconds = durationToSeconds(options.durationMs);

  return playToneAt(
    context,
    options,
    destination,
    context.currentTime,
    durationSeconds,
  );
}

export function playFrequencySweep(
  context: AudioContext,
  options: FrequencySweepOptions,
  destination: AudioNode = context.destination,
): PlaybackHandle {
  const pattern = normalizePlaybackPattern(options.pattern);
  const durationSeconds = durationToSeconds(options.durationMs, true);

  if (pattern.repeat > 1) {
    return createPatternPlaybackHandle(
      context,
      pattern,
      durationSeconds,
      (at) =>
        playFrequencySweepAt(
          context,
          options,
          destination,
          at,
          durationSeconds,
        ),
    );
  }

  return playFrequencySweepAt(
    context,
    options,
    destination,
    context.currentTime,
    durationSeconds,
  );
}

export function playNoise(
  context: AudioContext,
  options: NoiseOptions,
  destination: AudioNode = context.destination,
): PlaybackHandle {
  const pattern = normalizePlaybackPattern(options.pattern);
  const durationSeconds = durationToSeconds(options.durationMs, true);

  if (pattern.repeat > 1) {
    return createPatternPlaybackHandle(
      context,
      pattern,
      durationSeconds,
      (at) => playNoiseAt(context, options, destination, at, durationSeconds),
    );
  }

  return playNoiseAt(
    context,
    options,
    destination,
    context.currentTime,
    durationSeconds,
  );
}

function playToneAt(
  context: AudioContext,
  options: ToneOptions,
  destination: AudioNode,
  startTime: number,
  durationSeconds: number | undefined,
): PlaybackHandle {
  const graph = createSourcePlaybackGraph(
    context,
    context.createOscillator(),
    options,
    destination,
    startTime,
    durationSeconds,
  );

  graph.source.frequency.setValueAtTime(
    clampFrequency(options.frequency),
    startTime,
  );
  graph.source.start(startTime);
  if (durationSeconds !== undefined) {
    graph.source.stop(startTime + durationSeconds);
  }

  return createPlaybackHandle(context, graph);
}

function playFrequencySweepAt(
  context: AudioContext,
  options: FrequencySweepOptions,
  destination: AudioNode,
  startTime: number,
  sweepDurationSeconds: number,
): PlaybackHandle {
  const graph = createSourcePlaybackGraph(
    context,
    context.createOscillator(),
    options,
    destination,
    startTime,
    sweepDurationSeconds,
  );
  const end = startTime + sweepDurationSeconds;

  graph.source.frequency.cancelScheduledValues(startTime);
  graph.source.frequency.setValueAtTime(
    clampFrequency(options.from),
    startTime,
  );
  graph.source.frequency.linearRampToValueAtTime(
    clampFrequency(options.to),
    end,
  );
  graph.source.start(startTime);
  graph.source.stop(end);

  return createPlaybackHandle(context, graph);
}

function playNoiseAt(
  context: AudioContext,
  options: NoiseOptions,
  destination: AudioNode,
  startTime: number,
  durationSeconds: number,
): PlaybackHandle {
  const source = context.createBufferSource();
  source.buffer = createNoiseBuffer(
    context,
    normalizeNoiseType(options.type),
    durationSeconds,
  );

  const graph = createSourcePlaybackGraph(
    context,
    source,
    options,
    destination,
    startTime,
    durationSeconds,
  );
  const end = startTime + durationSeconds;

  graph.source.start(startTime);
  graph.source.stop(end);

  return createPlaybackHandle(context, graph);
}

type PlaybackGraph<TSource extends AudioScheduledSourceNode> = {
  source: TSource;
  gain: GainNode;
  panner?: StereoPannerNode;
  releaseSeconds: number;
};

function createSourcePlaybackGraph<TSource extends AudioScheduledSourceNode>(
  context: AudioContext,
  source: TSource,
  options: PlaybackGraphOptions,
  destination: AudioNode,
  startTime = context.currentTime,
  durationSeconds?: number,
): PlaybackGraph<TSource> {
  const gain = context.createGain();
  const panner =
    typeof context.createStereoPanner === "function"
      ? context.createStereoPanner()
      : undefined;

  if ("type" in source && typeof options.type === "string") {
    source.type = options.type;
  }
  const releaseSeconds = scheduleGainEnvelope(
    gain.gain,
    options,
    startTime,
    durationSeconds,
  );

  source.connect(gain);
  if (panner) {
    panner.pan.setValueAtTime(normalizePan(options.pan), startTime);
    gain.connect(panner);
    panner.connect(destination);
  } else {
    gain.connect(destination);
  }

  return { source, gain, panner, releaseSeconds };
}

type PlaybackGraphOptions = {
  envelope?: PlaybackEnvelope;
  gain?: number;
  pan?: number;
  type?: string;
};

type NormalizedPlaybackEnvelope = {
  attackSeconds: number;
  decaySeconds: number;
  sustain: number;
  releaseSeconds: number;
};

type NormalizedPlaybackPattern = {
  repeat: number;
  gapSeconds: number;
};

function createPatternPlaybackHandle(
  context: AudioContext,
  pattern: NormalizedPlaybackPattern,
  durationSeconds: number,
  playAt: (startTime: number) => PlaybackHandle,
): PlaybackHandle {
  const handles: PlaybackHandle[] = [];
  const intervalSeconds = durationSeconds + pattern.gapSeconds;
  const firstStartTime = context.currentTime;

  for (let index = 0; index < pattern.repeat; index += 1) {
    handles.push(playAt(firstStartTime + index * intervalSeconds));
  }

  return createCompositePlaybackHandle(handles);
}

function createCompositePlaybackHandle(
  handles: PlaybackHandle[],
): PlaybackHandle {
  let stopped = false;

  return {
    stop() {
      if (stopped) {
        return;
      }

      stopped = true;
      for (const handle of handles) {
        handle.stop();
      }
    },
  };
}

function createPlaybackHandle<TSource extends AudioScheduledSourceNode>(
  context: AudioContext,
  graph: PlaybackGraph<TSource>,
): PlaybackHandle {
  let stopped = false;

  const cleanup = () => {
    stopped = true;
    safeDisconnect(graph.source);
    safeDisconnect(graph.gain);
    if (graph.panner) {
      safeDisconnect(graph.panner);
    }
  };

  graph.source.onended = cleanup;

  return {
    stop() {
      if (stopped) {
        return;
      }

      try {
        graph.source.stop(getManualStopTime(context, graph));
      } catch {
        cleanup();
      }
    },
  };
}

function getManualStopTime<TSource extends AudioScheduledSourceNode>(
  context: AudioContext,
  graph: PlaybackGraph<TSource>,
): number {
  const now = context.currentTime;
  if (graph.releaseSeconds <= 0) {
    return now;
  }

  const stopTime = now + graph.releaseSeconds;
  const currentGain = Number.isFinite(graph.gain.gain.value)
    ? graph.gain.gain.value
    : 0;

  graph.gain.gain.cancelScheduledValues(now);
  graph.gain.gain.setValueAtTime(currentGain, now);
  graph.gain.gain.linearRampToValueAtTime(0, stopTime);

  return stopTime;
}

function createNoiseBuffer(
  context: AudioContext,
  type: NoiseType,
  durationSeconds: number,
): AudioBuffer {
  const length = Math.max(1, Math.ceil(context.sampleRate * durationSeconds));
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const samples = buffer.getChannelData(0);

  if (type === "pink") {
    fillPinkNoise(samples);
  } else if (type === "brown") {
    fillBrownNoise(samples);
  } else {
    fillWhiteNoise(samples);
  }

  return buffer;
}

function fillWhiteNoise(samples: Float32Array): void {
  for (let index = 0; index < samples.length; index += 1) {
    samples[index] = randomBipolar();
  }
}

function fillPinkNoise(samples: Float32Array): void {
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  let b3 = 0;
  let b4 = 0;
  let b5 = 0;
  let b6 = 0;

  for (let index = 0; index < samples.length; index += 1) {
    const white = randomBipolar();
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.969 * b2 + white * 0.153852;
    b3 = 0.8665 * b3 + white * 0.3104856;
    b4 = 0.55 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.016898;
    const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    b6 = white * 0.115926;
    samples[index] = clampSample(pink * 0.11);
  }
}

function fillBrownNoise(samples: Float32Array): void {
  let last = 0;

  for (let index = 0; index < samples.length; index += 1) {
    const white = randomBipolar();
    last = (last + 0.02 * white) / 1.02;
    samples[index] = clampSample(last * 3.5);
  }
}

function normalizeGain(value: number | undefined): number {
  if (value === undefined) {
    return DEFAULT_GAIN;
  }

  if (!Number.isFinite(value)) {
    return DEFAULT_GAIN;
  }

  return Math.max(0, value);
}

function normalizePan(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) {
    return 0;
  }

  return Math.min(1, Math.max(-1, value));
}

function normalizeNoiseType(value: NoiseType | undefined): NoiseType {
  if (value === "pink" || value === "brown") {
    return value;
  }

  return "white";
}

function scheduleGainEnvelope(
  gain: AudioParam,
  options: PlaybackGraphOptions,
  startTime: number,
  durationSeconds: number | undefined,
): number {
  const targetGain = normalizeGain(options.gain);
  const envelope = normalizePlaybackEnvelope(options.envelope);

  if (!envelope) {
    gain.setValueAtTime(targetGain, startTime);
    return 0;
  }

  const sustainGain = targetGain * envelope.sustain;
  const attackEnd = startTime + envelope.attackSeconds;
  const decayEnd = attackEnd + envelope.decaySeconds;

  gain.cancelScheduledValues(startTime);
  gain.setValueAtTime(0, startTime);

  if (envelope.attackSeconds > 0) {
    gain.linearRampToValueAtTime(targetGain, attackEnd);
  } else {
    gain.setValueAtTime(targetGain, startTime);
  }

  if (envelope.decaySeconds > 0) {
    gain.linearRampToValueAtTime(sustainGain, decayEnd);
  } else if (envelope.sustain !== 1) {
    gain.setValueAtTime(sustainGain, attackEnd);
  }

  if (durationSeconds !== undefined && envelope.releaseSeconds > 0) {
    const endTime = startTime + durationSeconds;
    const releaseSeconds = Math.min(envelope.releaseSeconds, durationSeconds);
    const releaseStart = endTime - releaseSeconds;

    gain.setValueAtTime(sustainGain, releaseStart);
    gain.linearRampToValueAtTime(0, endTime);
  }

  return envelope.releaseSeconds;
}

function normalizePlaybackPattern(
  pattern: PlaybackPattern | undefined,
): NormalizedPlaybackPattern {
  const repeat = pattern?.repeat ?? 1;
  const gapMs = pattern?.gapMs ?? 0;

  if (!Number.isInteger(repeat) || repeat < 1) {
    throw new Error("pattern.repeat must be a positive integer");
  }

  if (!Number.isFinite(gapMs) || gapMs < 0) {
    throw new Error("pattern.gapMs must be a non-negative number");
  }

  return { repeat, gapSeconds: gapMs / 1000 };
}

function normalizePlaybackEnvelope(
  envelope: PlaybackEnvelope | undefined,
): NormalizedPlaybackEnvelope | undefined {
  if (!envelope) {
    return undefined;
  }

  return {
    attackSeconds: normalizeEnvelopeDuration(envelope.attackMs, "attackMs"),
    decaySeconds: normalizeEnvelopeDuration(envelope.decayMs, "decayMs"),
    sustain: normalizeEnvelopeSustain(envelope.sustain),
    releaseSeconds: normalizeEnvelopeDuration(envelope.releaseMs, "releaseMs"),
  };
}

function normalizeEnvelopeDuration(
  value: number | undefined,
  name: "attackMs" | "decayMs" | "releaseMs",
): number {
  if (value === undefined) {
    return 0;
  }

  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`envelope.${name} must be a non-negative number`);
  }

  return value / 1000;
}

function normalizeEnvelopeSustain(value: number | undefined): number {
  if (value === undefined) {
    return 1;
  }

  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error("envelope.sustain must be between 0 and 1");
  }

  return value;
}

function randomBipolar(): number {
  return Math.random() * 2 - 1;
}

function clampSample(value: number): number {
  return Math.max(-1, Math.min(1, value));
}

function isPositiveFinite(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

function positiveModulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

function durationToSeconds(
  durationMs: number | undefined,
  required: true,
): number;
function durationToSeconds(
  durationMs: number | undefined,
  required?: false,
): number | undefined;
function durationToSeconds(
  durationMs: number | undefined,
  required = false,
): number | undefined {
  if (durationMs === undefined) {
    if (required) {
      throw new Error("durationMs must be a positive number");
    }

    return undefined;
  }

  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    throw new Error("durationMs must be a positive number");
  }

  return durationMs / 1000;
}

function safeDisconnect(node: AudioNode): void {
  try {
    node.disconnect();
  } catch {
    // Some Web Audio nodes throw if already disconnected.
  }
}
