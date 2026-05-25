"use client";

import { useState } from "react";
import {
  AudioProvider,
  SpectrumCanvas,
  WaveformCanvas as AudioWaveformCanvas,
  dbToGain,
  frequencyToNoteName,
  gainToDb,
  useAnalyser,
  useAudioContext,
  useAudioTestMode,
  useFrequencySweep,
  useNoise,
  useTone,
  useVolume,
} from "@webaudio-kit/react";

const waveforms: OscillatorType[] = ["sine", "square", "sawtooth", "triangle"];
const noiseTypes = ["white", "pink", "brown"] as const;

export function InteractiveDemo() {
  return (
    <AudioProvider>
      <DemoControls />
    </AudioProvider>
  );
}

function DemoControls() {
  const [frequency, setFrequency] = useState(440);
  const [gainDb, setGainDb] = useState(-18);
  const [pan, setPan] = useState(0);
  const [type, setType] = useState<OscillatorType>("sine");
  const [noiseType, setNoiseType] =
    useState<(typeof noiseTypes)[number]>("white");
  const gain = dbToGain(gainDb);
  const noteName = frequencyToNoteName(frequency);
  const audio = useAudioContext();
  const volume = useVolume();
  const audioTest = useAudioTestMode();
  const tone = useTone({ frequency, gain, pan, type });
  const sweep = useFrequencySweep({
    from: 250,
    to: 8000,
    durationMs: 2400,
    gain,
    pan,
    type,
  });
  const noise = useNoise({
    durationMs: 900,
    gain: Math.min(gain, 0.12),
    pan,
    type: noiseType,
  });

  const playTone = async () => {
    sweep.stop();
    noise.stop();
    audioTest.stop();
    await tone.play();
  };

  const runSweep = async () => {
    tone.stop();
    noise.stop();
    audioTest.stop();
    await sweep.play();
  };

  const playNoise = async () => {
    tone.stop();
    sweep.stop();
    audioTest.stop();
    await noise.play();
  };

  const runTestMode = async () => {
    tone.stop();
    sweep.stop();
    noise.stop();
    await audioTest.run();
  };

  const stopAll = () => {
    tone.stop();
    sweep.stop();
    noise.stop();
    audioTest.stop();
  };
  const signalState = tone.isPlaying
    ? "tone"
    : sweep.isPlaying
      ? "sweep"
      : noise.isPlaying
        ? "noise"
        : audioTest.isRunning
          ? "test"
          : "idle";

  return (
    <div className="demoShell" aria-label="Interactive Web Audio demo">
      <div className="demoHeader">
        <div>
          <span className="kicker">Live demo</span>
          <h2>Play a tone. Sweep a range. Burst noise.</h2>
        </div>
        <div className="demoState">
          <div>
            <span>AudioContext</span>
            <strong>{audio.state}</strong>
          </div>
          <div>
            <span>Signal</span>
            <strong>{signalState}</strong>
          </div>
        </div>
      </div>

      <div className="demoViewport">
        <div
          aria-label="Primary audio controls"
          className="controlPanel primaryControlPanel"
          role="region"
        >
          <div className="controlHead">
            <span>Tone generator</span>
            <strong>
              {frequency} Hz / {noteName}
            </strong>
          </div>

          <div className="primaryControlGrid">
            <label className="rangeControl">
              <span>Frequency</span>
              <input
                min="20"
                max="20000"
                onChange={(event) => setFrequency(Number(event.target.value))}
                step="1"
                type="range"
                value={frequency}
              />
            </label>

            <label className="rangeControl">
              <span>Gain</span>
              <input
                min="-48"
                max="0"
                onChange={(event) => setGainDb(Number(event.target.value))}
                step="1"
                type="range"
                value={gainDb}
              />
              <small>
                {gainDb} dB / gain {gain.toFixed(3)} /{" "}
                {gainToDb(gain).toFixed(1)} dB
              </small>
            </label>

            <label className="rangeControl">
              <span>Pan</span>
              <input
                min="-1"
                max="1"
                onChange={(event) => setPan(Number(event.target.value))}
                step="0.01"
                type="range"
                value={pan}
              />
              <small>{pan < 0 ? "left" : pan > 0 ? "right" : "center"}</small>
            </label>

            <label className="rangeControl">
              <span>Master volume</span>
              <input
                min="0"
                max="1"
                onChange={(event) =>
                  void volume.setGain(Number(event.target.value))
                }
                step="0.01"
                type="range"
                value={volume.gain}
              />
              <small>{volume.gain.toFixed(2)}</small>
            </label>
          </div>

          <div
            className="segmentedControl waveformTypeControl"
            aria-label="Waveform"
          >
            {waveforms.map((waveform) => (
              <button
                className={waveform === type ? "active" : undefined}
                key={waveform}
                onClick={() => setType(waveform)}
                aria-pressed={waveform === type}
                type="button"
              >
                {waveform}
              </button>
            ))}
          </div>

          <div className="demoActions">
            <button
              className="button buttonPrimary"
              onClick={playTone}
              type="button"
            >
              {tone.isPlaying ? "Restart tone" : "Play tone"}
            </button>
            <button className="button" onClick={stopAll} type="button">
              Stop
            </button>
          </div>
        </div>

        <WaveformPanel />
      </div>

      <div
        aria-label="Additional audio checks"
        className="demoControls secondaryControls"
        role="region"
      >
        <div className="controlPanel sweepControls">
          <div className="controlHead">
            <span>Frequency sweep</span>
            <strong>250 Hz to 8000 Hz</strong>
          </div>
          <p>
            Uses the current waveform, gain, pan, master volume, and analyser
            route.
          </p>
          <div className="demoActions">
            <button
              className="button buttonPrimary"
              onClick={runSweep}
              type="button"
            >
              {sweep.isPlaying ? "Restart sweep" : "Run sweep"}
            </button>
            <button className="button" onClick={stopAll} type="button">
              Stop
            </button>
          </div>
        </div>

        <div className="controlPanel noiseControls">
          <div className="controlHead">
            <span>Noise burst</span>
            <strong>{noiseType}</strong>
          </div>
          <p>
            Noise buffers use the same safe routing: source, gain, pan, master
            volume, analyser, then destination.
          </p>
          <div
            className="segmentedControl noiseTypeControl"
            aria-label="Noise type"
          >
            {noiseTypes.map((nextNoiseType) => (
              <button
                className={nextNoiseType === noiseType ? "active" : undefined}
                key={nextNoiseType}
                onClick={() => setNoiseType(nextNoiseType)}
                aria-pressed={nextNoiseType === noiseType}
                type="button"
              >
                {nextNoiseType}
              </button>
            ))}
          </div>
          <div className="demoActions">
            <button
              className="button buttonPrimary"
              onClick={playNoise}
              type="button"
            >
              {noise.isPlaying ? "Restart noise" : "Play noise"}
            </button>
            <button className="button" onClick={stopAll} type="button">
              Stop
            </button>
          </div>
        </div>

        <div className="controlPanel testModeControls">
          <div className="controlHead">
            <span>Test mode</span>
            <strong>{audioTest.currentStep?.label ?? "ready"}</strong>
          </div>
          <p>
            A short low-gain sequence checks center tone, stereo pan, sweep,
            noise, and analyser routing without making medical claims.
          </p>
          <ol className="testStepList">
            {audioTest.steps.map((step, index) => (
              <li
                className={
                  audioTest.currentStepIndex === index ? "active" : undefined
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
              onClick={runTestMode}
              type="button"
            >
              {audioTest.isRunning ? "Restart test" : "Run test"}
            </button>
            <button className="button" onClick={stopAll} type="button">
              Stop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WaveformPanel() {
  const analyser = useAnalyser();

  return (
    <div
      aria-label="Live analyser panel"
      className="waveformFrame"
      role="region"
    >
      <div className="controlHead">
        <span>Analyser</span>
        <strong>{analyser ? "live" : "waiting for click"}</strong>
      </div>
      <span className="visualizerLabel">Waveform</span>
      <AudioWaveformCanvas
        aria-label="Waveform analyser"
        backgroundColor="#0f120f"
        height="150"
        idleStrokeColor="#394135"
        strokeColor="#b9e145"
        width="900"
      />
      <span className="visualizerLabel">Spectrum</span>
      <SpectrumCanvas
        aria-label="Spectrum analyser"
        backgroundColor="#0f120f"
        barColor="#8ed8ff"
        height="96"
        idleBarColor="#394135"
        width="900"
      />
    </div>
  );
}
