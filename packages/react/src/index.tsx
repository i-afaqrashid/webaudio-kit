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
  type NoiseOptions,
  type PlaybackHandle,
  type PlaybackPattern,
  playFrequencySweep,
  playNoise,
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
  stopAll(): void;
};

export type AudioEngineControls = AudioProviderValue & {
  playTone(options: ToneOptions): Promise<PlaybackHandle>;
  playFrequencySweep(options: FrequencySweepOptions): Promise<PlaybackHandle>;
  playNoise(options: NoiseOptions): Promise<PlaybackHandle>;
  withAudioRuntime<T>(
    callback: (runtime: AudioRuntime) => T | Promise<T>,
  ): Promise<T>;
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

export type AudioTestModeStep =
  | {
      description: string;
      durationMs: number;
      id: string;
      kind: "tone";
      label: string;
      tone: ToneOptions;
    }
  | {
      description: string;
      durationMs: number;
      id: string;
      kind: "sweep";
      label: string;
      sweep: FrequencySweepOptions;
    }
  | {
      description: string;
      durationMs: number;
      id: string;
      kind: "noise";
      label: string;
      noise: NoiseOptions;
    };

export type AudioTestModeOptions = {
  gapMs?: number;
  steps?: AudioTestModeStep[];
};

export type AudioTestModeControls = {
  currentStep: AudioTestModeStep | null;
  currentStepIndex: number;
  isRunning: boolean;
  run(): Promise<void>;
  stop(): void;
  steps: AudioTestModeStep[];
};

export type PlaybackControls<TOptions> = {
  play(overrides?: Partial<TOptions>): Promise<void>;
  stop(): void;
  isPlaying: boolean;
};

export type RequiredPlaybackControls<TOptions> = {
  play(options: TOptions): Promise<void>;
  stop(): void;
  isPlaying: boolean;
};

type PlaybackRegistration = symbol;

type EnginePlaybackRecord = {
  handle: PlaybackHandle;
  registration: PlaybackRegistration;
  stopped: boolean;
  timeout: PlaybackTimer | undefined;
};

type AudioProviderContextValue = AudioProviderValue & {
  registerPlayback(stop: () => void): PlaybackRegistration;
  unregisterPlayback(registration: PlaybackRegistration): void;
};

const AudioContextStateContext = createContext<
  AudioProviderContextValue | undefined
>(undefined);

const DEFAULT_AUDIO_TEST_STEPS: AudioTestModeStep[] = [
  {
    description: "Short centered sine tone for basic output verification.",
    durationMs: 320,
    id: "center-tone",
    kind: "tone",
    label: "Center tone",
    tone: { durationMs: 320, frequency: 440, gain: 0.05, pan: 0, type: "sine" },
  },
  {
    description: "Short left-panned tone for stereo routing verification.",
    durationMs: 320,
    id: "left-tone",
    kind: "tone",
    label: "Left pan",
    tone: {
      durationMs: 320,
      frequency: 660,
      gain: 0.04,
      pan: -0.8,
      type: "sine",
    },
  },
  {
    description: "Short right-panned tone for stereo routing verification.",
    durationMs: 320,
    id: "right-tone",
    kind: "tone",
    label: "Right pan",
    tone: {
      durationMs: 320,
      frequency: 660,
      gain: 0.04,
      pan: 0.8,
      type: "sine",
    },
  },
  {
    description: "Conservative low-to-mid sweep for ramp scheduling checks.",
    durationMs: 700,
    id: "short-sweep",
    kind: "sweep",
    label: "Short sweep",
    sweep: {
      durationMs: 700,
      from: 250,
      gain: 0.035,
      pan: 0,
      to: 2000,
      type: "sine",
    },
  },
  {
    description: "Short pink-noise burst for buffer playback checks.",
    durationMs: 450,
    id: "pink-noise",
    kind: "noise",
    label: "Pink noise",
    noise: { durationMs: 450, gain: 0.025, pan: 0, type: "pink" },
  },
];

export function AudioProvider({
  children,
  initialGain = DEFAULT_GAIN,
}: AudioProviderProps) {
  const runtimeRef = useRef<AudioRuntime | null>(null);
  const gainRef = useRef(normalizeGain(initialGain));
  const playbackStopsRef = useRef(new Map<PlaybackRegistration, () => void>());
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

  const registerPlayback = useCallback((stop: () => void) => {
    const registration = Symbol("webaudio-kit-playback");
    playbackStopsRef.current.set(registration, stop);
    return registration;
  }, []);

  const unregisterPlayback = useCallback(
    (registration: PlaybackRegistration) => {
      playbackStopsRef.current.delete(registration);
    },
    [],
  );

  const stopAll = useCallback(() => {
    stopRegisteredPlayback(playbackStopsRef.current);
  }, []);

  useEffect(() => {
    return () => {
      stopRegisteredPlayback(playbackStopsRef.current);
      const current = runtimeRef.current;
      if (current && current.audioContext.state !== "closed") {
        void current.audioContext.close();
      }
    };
  }, []);

  const value = useMemo<AudioProviderContextValue>(
    () => ({
      audioContext: runtime?.audioContext ?? null,
      masterGain: runtime?.masterGain ?? null,
      analyser: runtime?.analyser ?? null,
      state,
      gain,
      ensureAudioContext,
      registerPlayback,
      setGain,
      stopAll,
      unregisterPlayback,
    }),
    [
      ensureAudioContext,
      gain,
      registerPlayback,
      runtime,
      setGain,
      state,
      stopAll,
      unregisterPlayback,
    ],
  );

  return (
    <AudioContextStateContext.Provider value={value}>
      {children}
    </AudioContextStateContext.Provider>
  );
}

export function useAudioContext(): AudioProviderValue {
  return useAudioProviderContext();
}

export function useAudioEngine(): AudioEngineControls {
  const provider = useAudioProviderContext();
  const {
    ensureAudioContext,
    registerPlayback,
    setGain,
    stopAll,
    unregisterPlayback,
  } = provider;
  const recordsRef = useRef(new Set<EnginePlaybackRecord>());

  const registerEnginePlayback = useCallback(
    (handle: PlaybackHandle, durationMs: number | undefined) => {
      const wrapped: PlaybackHandle = {
        stop() {
          if (record.stopped) {
            return;
          }

          record.stopped = true;
          clearEnginePlaybackTimer(record);
          handle.stop();
          unregisterPlayback(record.registration);
          recordsRef.current.delete(record);
        },
      };

      const record: EnginePlaybackRecord = {
        handle,
        registration: registerPlayback(wrapped.stop),
        stopped: false,
        timeout: undefined,
      };
      recordsRef.current.add(record);

      if (
        durationMs !== undefined &&
        Number.isFinite(durationMs) &&
        durationMs > 0
      ) {
        record.timeout = globalThis.setTimeout(() => {
          if (record.stopped) {
            return;
          }

          record.stopped = true;
          record.timeout = undefined;
          unregisterPlayback(record.registration);
          recordsRef.current.delete(record);
        }, durationMs);
      }

      return wrapped;
    },
    [registerPlayback, unregisterPlayback],
  );

  const playEngineTone = useCallback(
    async (options: ToneOptions) => {
      const runtime = await ensureAudioContext();
      const handle = playTone(
        runtime.audioContext,
        options,
        runtime.masterGain,
      );
      return registerEnginePlayback(handle, getPlaybackDurationMs(options));
    },
    [ensureAudioContext, registerEnginePlayback],
  );

  const playEngineFrequencySweep = useCallback(
    async (options: FrequencySweepOptions) => {
      const runtime = await ensureAudioContext();
      const handle = playFrequencySweep(
        runtime.audioContext,
        options,
        runtime.masterGain,
      );
      return registerEnginePlayback(handle, getPlaybackDurationMs(options));
    },
    [ensureAudioContext, registerEnginePlayback],
  );

  const playEngineNoise = useCallback(
    async (options: NoiseOptions) => {
      const runtime = await ensureAudioContext();
      const handle = playNoise(
        runtime.audioContext,
        options,
        runtime.masterGain,
      );
      return registerEnginePlayback(handle, getPlaybackDurationMs(options));
    },
    [ensureAudioContext, registerEnginePlayback],
  );

  const withAudioRuntime = useCallback(
    async <T,>(callback: (runtime: AudioRuntime) => T | Promise<T>) => {
      const runtime = await ensureAudioContext();
      return callback(runtime);
    },
    [ensureAudioContext],
  );

  useEffect(() => {
    return () => {
      stopEnginePlayback(recordsRef.current, unregisterPlayback);
    };
  }, [unregisterPlayback]);

  return useMemo<AudioEngineControls>(
    () => ({
      audioContext: provider.audioContext,
      masterGain: provider.masterGain,
      analyser: provider.analyser,
      state: provider.state,
      gain: provider.gain,
      ensureAudioContext,
      setGain,
      stopAll,
      playTone: playEngineTone,
      playFrequencySweep: playEngineFrequencySweep,
      playNoise: playEngineNoise,
      withAudioRuntime,
    }),
    [
      ensureAudioContext,
      playEngineFrequencySweep,
      playEngineNoise,
      playEngineTone,
      provider.analyser,
      provider.audioContext,
      provider.gain,
      provider.masterGain,
      provider.state,
      setGain,
      stopAll,
      withAudioRuntime,
    ],
  );
}

function useAudioProviderContext(): AudioProviderContextValue {
  const context = useContext(AudioContextStateContext);
  if (!context) {
    throw new Error("useAudioContext must be used inside AudioProvider");
  }

  return context;
}

export function useTone(): RequiredPlaybackControls<ToneOptions>;
export function useTone(options: ToneOptions): PlaybackControls<ToneOptions>;
export function useTone(
  options?: ToneOptions,
): PlaybackControls<ToneOptions> | RequiredPlaybackControls<ToneOptions> {
  const { ensureAudioContext, registerPlayback, unregisterPlayback } =
    useAudioProviderContext();
  const optionsRef = useLatest(options);
  const handleRef = useRef<PlaybackHandle | null>(null);
  const registrationRef = useRef<PlaybackRegistration | null>(null);
  const timeoutRef = useRef<PlaybackTimer | undefined>(undefined);
  const [isPlaying, setIsPlaying] = useState(false);

  const stop = useCallback(() => {
    clearPlaybackTimer(timeoutRef);
    handleRef.current?.stop();
    handleRef.current = null;
    if (registrationRef.current) {
      unregisterPlayback(registrationRef.current);
      registrationRef.current = null;
    }
    setIsPlaying(false);
  }, [unregisterPlayback]);

  const play = useCallback(
    async (overrides: Partial<ToneOptions> = {}) => {
      const runtime = await ensureAudioContext();
      const nextOptions = resolveToneOptions(optionsRef.current, overrides);

      stop();
      const handle = playTone(
        runtime.audioContext,
        nextOptions,
        runtime.masterGain,
      );
      handleRef.current = handle;
      registrationRef.current = registerPlayback(stop);
      setIsPlaying(true);
      schedulePlaybackEnd(
        getPlaybackDurationMs(nextOptions),
        timeoutRef,
        () => {
          if (registrationRef.current) {
            unregisterPlayback(registrationRef.current);
            registrationRef.current = null;
          }
          handleRef.current = null;
          setIsPlaying(false);
        },
      );
    },
    [
      ensureAudioContext,
      optionsRef,
      registerPlayback,
      stop,
      unregisterPlayback,
    ],
  );

  useEffect(() => stop, [stop]);

  return { play, stop, isPlaying };
}

export function useFrequencySweep(): RequiredPlaybackControls<FrequencySweepOptions>;
export function useFrequencySweep(
  options: FrequencySweepOptions,
): PlaybackControls<FrequencySweepOptions>;
export function useFrequencySweep(
  options?: FrequencySweepOptions,
):
  | PlaybackControls<FrequencySweepOptions>
  | RequiredPlaybackControls<FrequencySweepOptions> {
  const { ensureAudioContext, registerPlayback, unregisterPlayback } =
    useAudioProviderContext();
  const optionsRef = useLatest(options);
  const handleRef = useRef<PlaybackHandle | null>(null);
  const registrationRef = useRef<PlaybackRegistration | null>(null);
  const timeoutRef = useRef<PlaybackTimer | undefined>(undefined);
  const [isPlaying, setIsPlaying] = useState(false);

  const stop = useCallback(() => {
    clearPlaybackTimer(timeoutRef);
    handleRef.current?.stop();
    handleRef.current = null;
    if (registrationRef.current) {
      unregisterPlayback(registrationRef.current);
      registrationRef.current = null;
    }
    setIsPlaying(false);
  }, [unregisterPlayback]);

  const play = useCallback(
    async (overrides: Partial<FrequencySweepOptions> = {}) => {
      const runtime = await ensureAudioContext();
      const nextOptions = resolveFrequencySweepOptions(
        optionsRef.current,
        overrides,
      );

      stop();
      const handle = playFrequencySweep(
        runtime.audioContext,
        nextOptions,
        runtime.masterGain,
      );
      handleRef.current = handle;
      registrationRef.current = registerPlayback(stop);
      setIsPlaying(true);
      schedulePlaybackEnd(
        getPlaybackDurationMs(nextOptions),
        timeoutRef,
        () => {
          if (registrationRef.current) {
            unregisterPlayback(registrationRef.current);
            registrationRef.current = null;
          }
          handleRef.current = null;
          setIsPlaying(false);
        },
      );
    },
    [
      ensureAudioContext,
      optionsRef,
      registerPlayback,
      stop,
      unregisterPlayback,
    ],
  );

  useEffect(() => stop, [stop]);

  return { play, stop, isPlaying };
}

export function useNoise(): RequiredPlaybackControls<NoiseOptions>;
export function useNoise(options: NoiseOptions): PlaybackControls<NoiseOptions>;
export function useNoise(
  options?: NoiseOptions,
): PlaybackControls<NoiseOptions> | RequiredPlaybackControls<NoiseOptions> {
  const { ensureAudioContext, registerPlayback, unregisterPlayback } =
    useAudioProviderContext();
  const optionsRef = useLatest(options);
  const handleRef = useRef<PlaybackHandle | null>(null);
  const registrationRef = useRef<PlaybackRegistration | null>(null);
  const timeoutRef = useRef<PlaybackTimer | undefined>(undefined);
  const [isPlaying, setIsPlaying] = useState(false);

  const stop = useCallback(() => {
    clearPlaybackTimer(timeoutRef);
    handleRef.current?.stop();
    handleRef.current = null;
    if (registrationRef.current) {
      unregisterPlayback(registrationRef.current);
      registrationRef.current = null;
    }
    setIsPlaying(false);
  }, [unregisterPlayback]);

  const play = useCallback(
    async (overrides: Partial<NoiseOptions> = {}) => {
      const runtime = await ensureAudioContext();
      const nextOptions = resolveNoiseOptions(optionsRef.current, overrides);

      stop();
      const handle = playNoise(
        runtime.audioContext,
        nextOptions,
        runtime.masterGain,
      );
      handleRef.current = handle;
      registrationRef.current = registerPlayback(stop);
      setIsPlaying(true);
      schedulePlaybackEnd(
        getPlaybackDurationMs(nextOptions),
        timeoutRef,
        () => {
          if (registrationRef.current) {
            unregisterPlayback(registrationRef.current);
            registrationRef.current = null;
          }
          handleRef.current = null;
          setIsPlaying(false);
        },
      );
    },
    [
      ensureAudioContext,
      optionsRef,
      registerPlayback,
      stop,
      unregisterPlayback,
    ],
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

export function createDefaultAudioTestModeSteps(): AudioTestModeStep[] {
  return DEFAULT_AUDIO_TEST_STEPS.map(cloneAudioTestModeStep);
}

export function useAudioTestMode(
  options: AudioTestModeOptions = {},
): AudioTestModeControls {
  const { ensureAudioContext, registerPlayback, unregisterPlayback } =
    useAudioProviderContext();
  const steps = useMemo(
    () =>
      options.steps && options.steps.length > 0
        ? options.steps
        : createDefaultAudioTestModeSteps(),
    [options.steps],
  );
  const gapMs = normalizeDurationMs(options.gapMs, 120);
  const stepsRef = useLatest(steps);
  const gapMsRef = useLatest(gapMs);
  const activeHandleRef = useRef<PlaybackHandle | null>(null);
  const registrationRef = useRef<PlaybackRegistration | null>(null);
  const runTokenRef = useRef(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const currentStep =
    currentStepIndex >= 0 ? (steps[currentStepIndex] ?? null) : null;

  const stop = useCallback(() => {
    runTokenRef.current += 1;
    activeHandleRef.current?.stop();
    activeHandleRef.current = null;
    if (registrationRef.current) {
      unregisterPlayback(registrationRef.current);
      registrationRef.current = null;
    }
    setCurrentStepIndex(-1);
    setIsRunning(false);
  }, [unregisterPlayback]);

  const run = useCallback(async () => {
    const token = runTokenRef.current + 1;
    runTokenRef.current = token;
    activeHandleRef.current?.stop();
    activeHandleRef.current = null;
    if (registrationRef.current) {
      unregisterPlayback(registrationRef.current);
      registrationRef.current = null;
    }
    setIsRunning(true);

    try {
      const runtime = await ensureAudioContext();
      const nextSteps = stepsRef.current;
      const nextGapMs = gapMsRef.current;

      for (let index = 0; index < nextSteps.length; index += 1) {
        if (runTokenRef.current !== token) {
          return;
        }

        const step = nextSteps[index]!;
        const durationMs = getAudioTestModeStepDurationMs(step);
        setCurrentStepIndex(index);
        const handle = playAudioTestModeStep(runtime, step, durationMs);
        activeHandleRef.current = handle;
        registrationRef.current = registerPlayback(stop);
        await wait(durationMs);
        if (runTokenRef.current !== token) {
          return;
        }

        handle.stop();
        if (activeHandleRef.current === handle) {
          activeHandleRef.current = null;
        }
        if (registrationRef.current) {
          unregisterPlayback(registrationRef.current);
          registrationRef.current = null;
        }

        if (index < nextSteps.length - 1 && nextGapMs > 0) {
          await wait(nextGapMs);
        }
      }
    } finally {
      if (runTokenRef.current === token) {
        activeHandleRef.current = null;
        if (registrationRef.current) {
          unregisterPlayback(registrationRef.current);
          registrationRef.current = null;
        }
        setCurrentStepIndex(-1);
        setIsRunning(false);
      }
    }
  }, [
    ensureAudioContext,
    gapMsRef,
    registerPlayback,
    stop,
    stepsRef,
    unregisterPlayback,
  ]);

  useEffect(() => stop, [stop]);

  return { currentStep, currentStepIndex, isRunning, run, stop, steps };
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

function stopRegisteredPlayback(
  playbackStops: Map<PlaybackRegistration, () => void>,
): void {
  const stops = Array.from(playbackStops.values());
  playbackStops.clear();

  for (const stop of stops) {
    stop();
  }
}

function stopEnginePlayback(
  records: Set<EnginePlaybackRecord>,
  unregisterPlayback: (registration: PlaybackRegistration) => void,
): void {
  const activeRecords = Array.from(records);
  records.clear();

  for (const record of activeRecords) {
    if (record.stopped) {
      continue;
    }

    record.stopped = true;
    clearEnginePlaybackTimer(record);
    unregisterPlayback(record.registration);
    record.handle.stop();
  }
}

function clearEnginePlaybackTimer(record: EnginePlaybackRecord): void {
  if (record.timeout !== undefined) {
    globalThis.clearTimeout(record.timeout);
    record.timeout = undefined;
  }
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

function normalizeDurationMs(value: number | undefined, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(0, value ?? fallback);
}

function normalizePositiveDurationMs(
  value: number | undefined,
  fallback: number | undefined,
): number {
  const normalizedFallback =
    fallback !== undefined && Number.isFinite(fallback) && fallback > 0
      ? fallback
      : 250;

  if (!Number.isFinite(value) || value === undefined || value <= 0) {
    return normalizedFallback;
  }

  return value;
}

function resolveToneOptions(
  defaults: ToneOptions | undefined,
  overrides: Partial<ToneOptions>,
): ToneOptions {
  const options = { ...defaults, ...overrides };

  if (typeof options.frequency !== "number") {
    throw new Error("frequency must be provided before tone playback");
  }

  return options as ToneOptions;
}

function resolveFrequencySweepOptions(
  defaults: FrequencySweepOptions | undefined,
  overrides: Partial<FrequencySweepOptions>,
): FrequencySweepOptions {
  const options = { ...defaults, ...overrides };

  if (typeof options.from !== "number") {
    throw new Error("from must be provided before frequency sweep playback");
  }

  if (typeof options.to !== "number") {
    throw new Error("to must be provided before frequency sweep playback");
  }

  if (typeof options.durationMs !== "number") {
    throw new Error(
      "durationMs must be provided before frequency sweep playback",
    );
  }

  return options as FrequencySweepOptions;
}

function resolveNoiseOptions(
  defaults: NoiseOptions | undefined,
  overrides: Partial<NoiseOptions>,
): NoiseOptions {
  const options = { ...defaults, ...overrides };

  if (typeof options.durationMs !== "number") {
    throw new Error("durationMs must be provided before noise playback");
  }

  return options as NoiseOptions;
}

function cloneAudioTestModeStep(step: AudioTestModeStep): AudioTestModeStep {
  if (step.kind === "tone") {
    return { ...step, tone: { ...step.tone } };
  }

  if (step.kind === "sweep") {
    return { ...step, sweep: { ...step.sweep } };
  }

  return { ...step, noise: { ...step.noise } };
}

function getAudioTestModeStepDurationMs(step: AudioTestModeStep): number {
  if (step.kind === "tone") {
    return normalizePositiveDurationMs(step.durationMs, step.tone.durationMs);
  }

  if (step.kind === "sweep") {
    return normalizePositiveDurationMs(step.durationMs, step.sweep.durationMs);
  }

  return normalizePositiveDurationMs(step.durationMs, step.noise.durationMs);
}

function playAudioTestModeStep(
  runtime: AudioRuntime,
  step: AudioTestModeStep,
  durationMs: number,
): PlaybackHandle {
  if (step.kind === "tone") {
    return playTone(
      runtime.audioContext,
      { ...step.tone, durationMs },
      runtime.masterGain,
    );
  }

  if (step.kind === "sweep") {
    return playFrequencySweep(
      runtime.audioContext,
      { ...step.sweep, durationMs },
      runtime.masterGain,
    );
  }

  return playNoise(
    runtime.audioContext,
    { ...step.noise, durationMs },
    runtime.masterGain,
  );
}

function wait(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, durationMs);
  });
}

function schedulePlaybackEnd(
  durationMs: number | undefined,
  timeoutRef: { current: PlaybackTimer | undefined },
  onEnd: () => void,
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
    onEnd();
    timeoutRef.current = undefined;
  }, durationMs);
}

function getPlaybackDurationMs(options: {
  durationMs?: number;
  pattern?: PlaybackPattern;
}): number | undefined {
  const durationMs = options.durationMs;
  if (
    durationMs === undefined ||
    !Number.isFinite(durationMs) ||
    durationMs <= 0
  ) {
    return durationMs;
  }

  const repeat = options.pattern?.repeat ?? 1;
  const gapMs = options.pattern?.gapMs ?? 0;

  if (
    !Number.isInteger(repeat) ||
    repeat <= 1 ||
    !Number.isFinite(gapMs) ||
    gapMs < 0
  ) {
    return durationMs;
  }

  return repeat * durationMs + (repeat - 1) * gapMs;
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

export type {
  FrequencySweepOptions,
  NoiseOptions,
  NoiseType,
  NoteNameOptions,
  PlaybackEnvelope,
  PlaybackFilter,
  PlaybackHandle,
  PlaybackPattern,
  PlaybackVoices,
  ToneOptions,
} from "@webaudio-kit/core";
export {
  clampFrequency,
  dbToGain,
  frequencyToMidi,
  frequencyToNoteName,
  gainToDb,
  midiToFrequency,
} from "@webaudio-kit/core";
