"use client";

import {
  AudioProvider,
  SpectrumCanvas,
  WaveformCanvas,
  gainToDb,
  useAudioContext,
  useAudioTestMode,
  useFrequencySweep,
  useTone,
  useVolume,
} from "@webaudio-kit/react";

export type RecipeDemoKind =
  | "autoplay"
  | "monitoring"
  | "stop-all"
  | "sweep"
  | "test-mode"
  | "tone"
  | "visualizer"
  | "volume";

const demoLabels: Record<RecipeDemoKind, string> = {
  autoplay: "Autoplay-safe start",
  monitoring: "Severity cue profile",
  "stop-all": "Provider stop all",
  sweep: "250 Hz to 8000 Hz",
  "test-mode": "Low-gain sequence",
  tone: "440 Hz confirmation",
  visualizer: "Waveform and spectrum",
  volume: "Shared master gain",
};

export function RecipeLiveDemo({ kind }: { kind: RecipeDemoKind }) {
  return (
    <AudioProvider>
      <RecipeLiveDemoControls kind={kind} />
    </AudioProvider>
  );
}

function RecipeLiveDemoControls({ kind }: { kind: RecipeDemoKind }) {
  const audio = useAudioContext();
  const volume = useVolume();
  const tone = useTone({ frequency: 440, gain: 0.14, type: "sine" });
  const sweep = useFrequencySweep({
    durationMs: 2400,
    from: 250,
    gain: 0.1,
    to: 8000,
    type: "sine",
  });
  const analyserPing = useTone({
    durationMs: 420,
    frequency: 523.25,
    gain: 0.08,
    type: "triangle",
  });
  const safeStart = useTone({
    durationMs: 300,
    frequency: 660,
    gain: 0.08,
    type: "sine",
  });
  const monitoringTone = useTone();
  const monitoringSweep = useFrequencySweep();
  const testMode = useAudioTestMode();

  const stopAll = () => {
    audio.stopAll();
  };

  const runTone = async () => {
    stopAll();
    await tone.play({ durationMs: 600 });
  };

  const runSweep = async () => {
    stopAll();
    await sweep.play();
  };

  const runAnalyserPing = async () => {
    stopAll();
    await analyserPing.play();
  };

  const runSafeStart = async () => {
    stopAll();
    await safeStart.play();
  };

  const runWarningProfile = async () => {
    stopAll();
    await monitoringTone.play({
      durationMs: 130,
      envelope: { attackMs: 8, releaseMs: 55 },
      frequency: 760,
      gain: 0.09,
      pattern: { repeat: 2, gapMs: 100 },
      type: "triangle",
    });
  };

  const runCriticalProfile = async () => {
    stopAll();
    await monitoringSweep.play({
      durationMs: 620,
      envelope: { attackMs: 12, releaseMs: 90 },
      filter: { frequency: 2200, q: 0.8 },
      from: 520,
      gain: 0.1,
      pattern: { repeat: 2, gapMs: 140 },
      to: 1800,
      type: "sawtooth",
    });
  };

  const runTestMode = async () => {
    stopAll();
    await testMode.run();
  };

  const signalState = tone.isPlaying
    ? "tone"
    : sweep.isPlaying
      ? "sweep"
      : analyserPing.isPlaying
        ? "analyser"
        : safeStart.isPlaying
          ? "started"
          : monitoringTone.isPlaying
            ? "warning"
            : monitoringSweep.isPlaying
              ? "critical"
              : testMode.isRunning
                ? "test"
                : "idle";

  return (
    <div className="recipeDemoCard" aria-label={`${demoLabels[kind]} demo`}>
      <div className="recipeDemoHeader">
        <div>
          <span className="kicker">Live recipe demo</span>
          <strong>{demoLabels[kind]}</strong>
        </div>
        <div className="recipeDemoState" aria-label="Recipe audio state">
          <span>{audio.state}</span>
          <span>{signalState}</span>
        </div>
      </div>
      {kind === "tone" ? (
        <div className="recipeDemoBody">
          <p>Short confirmation tone using the same gain from the snippet.</p>
          <div className="demoActions">
            <button
              className="button buttonPrimary"
              onClick={() => void runTone()}
              type="button"
            >
              Play recipe tone
            </button>
            <button className="button" onClick={stopAll} type="button">
              Stop
            </button>
          </div>
        </div>
      ) : null}
      {kind === "sweep" ? (
        <div className="recipeDemoBody">
          <p>
            Runs the bounded sweep from the recipe through the provider graph.
          </p>
          <div className="recipeMetricGrid" aria-label="Sweep range">
            <span>250 Hz</span>
            <span>8000 Hz</span>
            <span>2400 ms</span>
          </div>
          <div className="demoActions">
            <button
              className="button buttonPrimary"
              onClick={() => void runSweep()}
              type="button"
            >
              Run recipe sweep
            </button>
            <button className="button" onClick={stopAll} type="button">
              Stop
            </button>
          </div>
        </div>
      ) : null}
      {kind === "volume" ? (
        <div className="recipeDemoBody">
          <label className="rangeControl">
            <span>Recipe master volume</span>
            <input
              aria-label="Recipe master volume"
              max="0.5"
              min="0"
              onChange={(event) =>
                void volume.setGain(Number(event.currentTarget.value))
              }
              step="0.01"
              type="range"
              value={volume.gain}
            />
            <small>
              gain {volume.gain.toFixed(2)} / {gainToDb(volume.gain).toFixed(1)}{" "}
              dB
            </small>
          </label>
          <div className="demoActions">
            <button
              className="button buttonPrimary"
              onClick={() => void runTone()}
              type="button"
            >
              Play volume check
            </button>
            <button className="button" onClick={stopAll} type="button">
              Stop
            </button>
          </div>
        </div>
      ) : null}
      {kind === "monitoring" ? (
        <div className="recipeDemoBody">
          <p>
            Runs warning or critical severity profiles with repeat patterns and
            conservative gain. Use acknowledge to cancel scheduled cues.
          </p>
          <div className="recipeMetricGrid" aria-label="Monitoring profiles">
            <span>warning</span>
            <span>critical</span>
            <span>stopAll()</span>
          </div>
          <div className="demoActions">
            <button
              className="button buttonPrimary"
              onClick={() => void runWarningProfile()}
              type="button"
            >
              Run warning profile
            </button>
            <button
              className="button buttonPrimary"
              onClick={() => void runCriticalProfile()}
              type="button"
            >
              Run critical profile
            </button>
            <button className="button" onClick={stopAll} type="button">
              Acknowledge
            </button>
          </div>
        </div>
      ) : null}
      {kind === "stop-all" ? (
        <div className="recipeDemoBody">
          <p>
            Start a cue, then stop every active or scheduled provider-owned
            playback handle.
          </p>
          <div className="demoActions">
            <button
              className="button buttonPrimary"
              onClick={() => void runTone()}
              type="button"
            >
              Start cue
            </button>
            <button className="button" onClick={stopAll} type="button">
              Stop all cues
            </button>
          </div>
        </div>
      ) : null}
      {kind === "visualizer" ? (
        <div className="recipeDemoBody">
          <p>
            Ping the analyser and watch both reusable canvas components react.
          </p>
          <div className="recipeVisualizerStack">
            <WaveformCanvas
              aria-label="Recipe waveform analyser"
              backgroundColor="#0f120f"
              height="76"
              idleStrokeColor="#394135"
              strokeColor="#b9e145"
              width="520"
            />
            <SpectrumCanvas
              aria-label="Recipe spectrum analyser"
              backgroundColor="#0f120f"
              barColor="#8ed8ff"
              height="58"
              idleBarColor="#394135"
              width="520"
            />
          </div>
          <div className="demoActions">
            <button
              className="button buttonPrimary"
              onClick={() => void runAnalyserPing()}
              type="button"
            >
              Ping analyser
            </button>
            <button className="button" onClick={stopAll} type="button">
              Stop
            </button>
          </div>
        </div>
      ) : null}
      {kind === "test-mode" ? (
        <div className="recipeDemoBody">
          <ol className="testStepList recipeTestSteps">
            {testMode.steps.map((step, index) => (
              <li
                className={
                  testMode.currentStepIndex === index ? "active" : undefined
                }
                key={step.id}
              >
                <span>{step.label}</span>
                <small>{step.durationMs}ms</small>
              </li>
            ))}
          </ol>
          <div className="demoActions">
            <button
              className="button buttonPrimary"
              onClick={() => void runTestMode()}
              type="button"
            >
              Run recipe test
            </button>
            <button className="button" onClick={stopAll} type="button">
              Stop
            </button>
          </div>
        </div>
      ) : null}
      {kind === "autoplay" ? (
        <div className="recipeDemoBody">
          <p>
            This button is the user action that lets the provider create and
            resume browser audio.
          </p>
          <div className="demoActions">
            <button
              className="button buttonPrimary"
              onClick={() => void runSafeStart()}
              type="button"
            >
              Start safe audio
            </button>
            <button className="button" onClick={stopAll} type="button">
              Stop
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
