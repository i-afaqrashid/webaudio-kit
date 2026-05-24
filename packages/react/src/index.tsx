"use client";

import {
  type CanvasHTMLAttributes,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DEFAULT_GAIN,
  type FrequencySweepOptions,
  type PlaybackHandle,
  playFrequencySweep,
  playTone,
  type ToneOptions,
} from "@webaudio-kit/core";

export type AudioRuntime = {
  audioContext: AudioContext;
  masterGain: GainNode;
  analyser: AnalyserNode;
};

export type AudioProviderValue = {
  audioContext: AudioContext | null;
  masterGain: GainNode | null;
  analyser: AnalyserNode | null;
  state: AudioContextState | "idle";
  gain: number;
  ensureAudioContext(): Promise<AudioRuntime>;
  setGain(gain: number): Promise<void>;
};

export type AudioProviderProps = {
  children: ReactNode;
  initialGain?: number;
};

export type WaveformCanvasProps = Omit<
  CanvasHTMLAttributes<HTMLCanvasElement>,
  "children"
> & {
  backgroundColor?: string;
  idleStrokeColor?: string;
  lineWidth?: number;
  strokeColor?: string;
};

export type SpectrumCanvasProps = Omit<
  CanvasHTMLAttributes<HTMLCanvasElement>,
  "children"
> & {
  backgroundColor?: string;
  barColor?: string;
  barCount?: number;
  barGap?: number;
  idleBarColor?: string;
  minBarHeight?: number;
};

const AudioContextStateContext = createContext<AudioProviderValue | undefined>(
  undefined,
);

export function AudioProvider({
  children,
  initialGain = DEFAULT_GAIN,
}: AudioProviderProps) {
  const runtimeRef = useRef<AudioRuntime | null>(null);
  const gainRef = useRef(normalizeGain(initialGain));
  const [runtime, setRuntime] = useState<AudioRuntime | null>(null);
  const [state, setState] = useState<AudioContextState | "idle">("idle");
  const [gain, setGainState] = useState(gainRef.current);

  const ensureAudioContext = useCallback(async (): Promise<AudioRuntime> => {
    const existing = runtimeRef.current;
    if (existing) {
      await resumeIfNeeded(existing.audioContext);
      setState(existing.audioContext.state);
      return existing;
    }

    const AudioContextConstructor = getAudioContextConstructor();
    const audioContext = new AudioContextConstructor();
    const masterGain = audioContext.createGain();
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 2048;
    masterGain.gain.setValueAtTime(gainRef.current, audioContext.currentTime);
    masterGain.connect(analyser);
    analyser.connect(audioContext.destination);

    const created = { audioContext, masterGain, analyser };
    runtimeRef.current = created;
    setRuntime(created);

    await resumeIfNeeded(audioContext);
    setState(audioContext.state);

    return created;
  }, []);

  const setGain = useCallback(async (nextGain: number) => {
    const normalized = normalizeGain(nextGain);
    gainRef.current = normalized;
    setGainState(normalized);

    const current = runtimeRef.current;
    if (current) {
      current.masterGain.gain.setValueAtTime(
        normalized,
        current.audioContext.currentTime,
      );
    }
  }, []);

  useEffect(() => {
    return () => {
      const current = runtimeRef.current;
      if (current && current.audioContext.state !== "closed") {
        void current.audioContext.close();
      }
    };
  }, []);

  const value = useMemo<AudioProviderValue>(
    () => ({
      audioContext: runtime?.audioContext ?? null,
      masterGain: runtime?.masterGain ?? null,
      analyser: runtime?.analyser ?? null,
      state,
      gain,
      ensureAudioContext,
      setGain,
    }),
    [ensureAudioContext, gain, runtime, setGain, state],
  );

  return (
    <AudioContextStateContext.Provider value={value}>
      {children}
    </AudioContextStateContext.Provider>
  );
}

export function useAudioContext(): AudioProviderValue {
  const context = useContext(AudioContextStateContext);
  if (!context) {
    throw new Error("useAudioContext must be used inside AudioProvider");
  }

  return context;
}

export function useTone(options: ToneOptions): {
  play(overrides?: Partial<ToneOptions>): Promise<void>;
  stop(): void;
  isPlaying: boolean;
} {
  const audio = useAudioContext();
  const optionsRef = useLatest(options);
  const handleRef = useRef<PlaybackHandle | null>(null);
  const timeoutRef = useRef<PlaybackTimer | undefined>(undefined);
  const [isPlaying, setIsPlaying] = useState(false);

  const stop = useCallback(() => {
    clearPlaybackTimer(timeoutRef);
    handleRef.current?.stop();
    handleRef.current = null;
    setIsPlaying(false);
  }, []);

  const play = useCallback(
    async (overrides: Partial<ToneOptions> = {}) => {
      const runtime = await audio.ensureAudioContext();
      const nextOptions = { ...optionsRef.current, ...overrides };

      stop();
      handleRef.current = playTone(
        runtime.audioContext,
        nextOptions,
        runtime.masterGain,
      );
      setIsPlaying(true);
      schedulePlaybackEnd(nextOptions.durationMs, timeoutRef, setIsPlaying);
    },
    [audio, optionsRef, stop],
  );

  useEffect(() => stop, [stop]);

  return { play, stop, isPlaying };
}

export function useFrequencySweep(options: FrequencySweepOptions): {
  play(overrides?: Partial<FrequencySweepOptions>): Promise<void>;
  stop(): void;
  isPlaying: boolean;
} {
  const audio = useAudioContext();
  const optionsRef = useLatest(options);
  const handleRef = useRef<PlaybackHandle | null>(null);
  const timeoutRef = useRef<PlaybackTimer | undefined>(undefined);
  const [isPlaying, setIsPlaying] = useState(false);

  const stop = useCallback(() => {
    clearPlaybackTimer(timeoutRef);
    handleRef.current?.stop();
    handleRef.current = null;
    setIsPlaying(false);
  }, []);

  const play = useCallback(
    async (overrides: Partial<FrequencySweepOptions> = {}) => {
      const runtime = await audio.ensureAudioContext();
      const nextOptions = { ...optionsRef.current, ...overrides };

      stop();
      handleRef.current = playFrequencySweep(
        runtime.audioContext,
        nextOptions,
        runtime.masterGain,
      );
      setIsPlaying(true);
      schedulePlaybackEnd(nextOptions.durationMs, timeoutRef, setIsPlaying);
    },
    [audio, optionsRef, stop],
  );

  useEffect(() => stop, [stop]);

  return { play, stop, isPlaying };
}

export function useVolume(): {
  gain: number;
  setGain(gain: number): Promise<void>;
} {
  const audio = useAudioContext();

  return {
    gain: audio.gain,
    setGain: audio.setGain,
  };
}

export function useAnalyser(): AnalyserNode | null {
  return useAudioContext().analyser;
}

export function WaveformCanvas({
  backgroundColor = "#10110f",
  height = 180,
  idleStrokeColor,
  lineWidth = 2,
  strokeColor = "#c8ea3a",
  width = 720,
  ...canvasProps
}: WaveformCanvasProps) {
  const analyser = useAnalyser();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ariaLabel = canvasProps["aria-label"] ?? "Waveform analyser";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) {
      return;
    }

    const drawIdle = () => {
      drawBackground(context, canvas, backgroundColor);
      context.strokeStyle = idleStrokeColor ?? strokeColor;
      context.lineWidth = lineWidth;
      context.beginPath();
      context.moveTo(0, canvas.height / 2);
      context.lineTo(canvas.width, canvas.height / 2);
      context.stroke();
    };

    if (!analyser) {
      drawIdle();
      return;
    }

    const data = new Uint8Array(analyser.fftSize);
    let frame = 0;

    const draw = () => {
      analyser.getByteTimeDomainData(data);
      drawBackground(context, canvas, backgroundColor);
      context.strokeStyle = strokeColor;
      context.lineWidth = lineWidth;
      context.beginPath();

      const slice = canvas.width / data.length;
      for (let index = 0; index < data.length; index += 1) {
        const x = index * slice;
        const y = (data[index] / 255) * canvas.height;
        if (index === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      }

      context.stroke();
      frame = globalThis.requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (frame !== 0) {
        globalThis.cancelAnimationFrame(frame);
      }
    };
  }, [
    analyser,
    backgroundColor,
    height,
    idleStrokeColor,
    lineWidth,
    strokeColor,
    width,
  ]);

  return (
    <canvas
      {...canvasProps}
      aria-label={ariaLabel}
      height={height}
      ref={canvasRef}
      width={width}
    />
  );
}

export function SpectrumCanvas({
  backgroundColor = "#10110f",
  barColor = "#c8ea3a",
  barCount = 48,
  barGap = 2,
  height = 180,
  idleBarColor,
  minBarHeight = 2,
  width = 720,
  ...canvasProps
}: SpectrumCanvasProps) {
  const analyser = useAnalyser();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ariaLabel = canvasProps["aria-label"] ?? "Spectrum analyser";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) {
      return;
    }

    const normalizedBarCount = normalizeBarCount(barCount);
    const normalizedBarGap = normalizeCanvasNumber(barGap, 2);
    const normalizedMinBarHeight = normalizeCanvasNumber(minBarHeight, 2);
    const drawBars = (data: Uint8Array | null) => {
      drawBackground(context, canvas, backgroundColor);
      context.fillStyle = data ? barColor : (idleBarColor ?? barColor);

      const totalGap = Math.max(0, normalizedBarCount - 1) * normalizedBarGap;
      const barWidth = Math.max(
        1,
        (canvas.width - totalGap) / normalizedBarCount,
      );

      for (let index = 0; index < normalizedBarCount; index += 1) {
        const value = data?.[index] ?? 0;
        const normalizedValue = value / 255;
        const barHeight = Math.max(
          normalizedMinBarHeight,
          normalizedValue * canvas.height,
        );
        const x = index * (barWidth + normalizedBarGap);
        const y = canvas.height - barHeight;
        context.fillRect(x, y, barWidth, barHeight);
      }
    };

    if (!analyser) {
      drawBars(null);
      return;
    }

    const data = new Uint8Array(
      Math.min(normalizedBarCount, analyser.frequencyBinCount),
    );
    let frame = 0;

    const draw = () => {
      analyser.getByteFrequencyData(data);
      drawBars(data);
      frame = globalThis.requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (frame !== 0) {
        globalThis.cancelAnimationFrame(frame);
      }
    };
  }, [
    analyser,
    backgroundColor,
    barColor,
    barCount,
    barGap,
    height,
    idleBarColor,
    minBarHeight,
    width,
  ]);

  return (
    <canvas
      {...canvasProps}
      aria-label={ariaLabel}
      height={height}
      ref={canvasRef}
      width={width}
    />
  );
}

function useLatest<T>(value: T) {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
}

function getAudioContextConstructor(): typeof AudioContext {
  const globalWithWebkit = globalThis as typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };
  const AudioContextConstructor =
    globalWithWebkit.AudioContext ?? globalWithWebkit.webkitAudioContext;

  if (!AudioContextConstructor) {
    throw new Error("Web Audio API is not available in this browser");
  }

  return AudioContextConstructor;
}

async function resumeIfNeeded(audioContext: AudioContext): Promise<void> {
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }
}

function normalizeGain(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_GAIN;
  }

  return Math.max(0, value);
}

function schedulePlaybackEnd(
  durationMs: number | undefined,
  timeoutRef: { current: PlaybackTimer | undefined },
  setIsPlaying: (value: boolean) => void,
): void {
  clearPlaybackTimer(timeoutRef);

  if (
    durationMs === undefined ||
    !Number.isFinite(durationMs) ||
    durationMs <= 0
  ) {
    return;
  }

  timeoutRef.current = globalThis.setTimeout(() => {
    setIsPlaying(false);
    timeoutRef.current = undefined;
  }, durationMs);
}

function clearPlaybackTimer(timeoutRef: {
  current: PlaybackTimer | undefined;
}): void {
  if (timeoutRef.current !== undefined) {
    globalThis.clearTimeout(timeoutRef.current);
    timeoutRef.current = undefined;
  }
}

type PlaybackTimer = ReturnType<typeof globalThis.setTimeout>;

function drawBackground(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  backgroundColor: string,
): void {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function normalizeBarCount(value: number): number {
  if (!Number.isFinite(value)) {
    return 48;
  }

  return Math.max(1, Math.floor(value));
}

function normalizeCanvasNumber(value: number, fallback: number): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(0, value);
}

export type { FrequencySweepOptions, PlaybackHandle, ToneOptions };
export { clampFrequency, dbToGain, gainToDb } from "@webaudio-kit/core";
