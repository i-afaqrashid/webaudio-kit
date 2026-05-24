export type ToneOptions = {
  frequency: number;
  gain?: number;
  type?: OscillatorType;
  pan?: number;
  durationMs?: number;
};

export type FrequencySweepOptions = {
  from: number;
  to: number;
  durationMs: number;
  gain?: number;
  type?: OscillatorType;
  pan?: number;
};

export type PlaybackHandle = {
  stop(): void;
};

export const DEFAULT_GAIN = 0.2;
export const DEFAULT_MIN_FREQUENCY = 20;
export const DEFAULT_MAX_FREQUENCY = 20_000;

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

export function playTone(
  context: AudioContext,
  options: ToneOptions,
  destination: AudioNode = context.destination,
): PlaybackHandle {
  const graph = createPlaybackGraph(context, options, destination);
  const now = context.currentTime;

  graph.oscillator.frequency.setValueAtTime(
    clampFrequency(options.frequency),
    now,
  );
  graph.oscillator.start(now);

  const durationSeconds = durationToSeconds(options.durationMs);
  if (durationSeconds !== undefined) {
    graph.oscillator.stop(now + durationSeconds);
  }

  return createPlaybackHandle(context, graph);
}

export function playFrequencySweep(
  context: AudioContext,
  options: FrequencySweepOptions,
  destination: AudioNode = context.destination,
): PlaybackHandle {
  const graph = createPlaybackGraph(context, options, destination);
  const now = context.currentTime;
  const sweepDurationSeconds = durationToSeconds(options.durationMs, true);
  const end = now + sweepDurationSeconds;

  graph.oscillator.frequency.cancelScheduledValues(now);
  graph.oscillator.frequency.setValueAtTime(clampFrequency(options.from), now);
  graph.oscillator.frequency.linearRampToValueAtTime(
    clampFrequency(options.to),
    end,
  );
  graph.oscillator.start(now);
  graph.oscillator.stop(end);

  return createPlaybackHandle(context, graph);
}

type PlaybackGraph = {
  oscillator: OscillatorNode;
  gain: GainNode;
  panner?: StereoPannerNode;
};

function createPlaybackGraph(
  context: AudioContext,
  options: Pick<ToneOptions, "gain" | "type" | "pan">,
  destination: AudioNode,
): PlaybackGraph {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const panner =
    typeof context.createStereoPanner === "function"
      ? context.createStereoPanner()
      : undefined;
  const now = context.currentTime;

  oscillator.type = options.type ?? "sine";
  gain.gain.setValueAtTime(normalizeGain(options.gain), now);

  oscillator.connect(gain);
  if (panner) {
    panner.pan.setValueAtTime(normalizePan(options.pan), now);
    gain.connect(panner);
    panner.connect(destination);
  } else {
    gain.connect(destination);
  }

  return { oscillator, gain, panner };
}

function createPlaybackHandle(
  context: AudioContext,
  graph: PlaybackGraph,
): PlaybackHandle {
  let stopped = false;

  const cleanup = () => {
    stopped = true;
    safeDisconnect(graph.oscillator);
    safeDisconnect(graph.gain);
    if (graph.panner) {
      safeDisconnect(graph.panner);
    }
  };

  graph.oscillator.onended = cleanup;

  return {
    stop() {
      if (stopped) {
        return;
      }

      try {
        graph.oscillator.stop(context.currentTime);
      } catch {
        cleanup();
      }
    },
  };
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

function durationToSeconds(durationMs: number, required: true): number;
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
