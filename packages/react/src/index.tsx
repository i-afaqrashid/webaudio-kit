import {
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

export type { FrequencySweepOptions, PlaybackHandle, ToneOptions };
export { clampFrequency, dbToGain, gainToDb } from "@webaudio-kit/core";
