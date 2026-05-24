import { useState } from "react";
import {
  WaveformCanvas,
  frequencyToNoteName,
  SpectrumCanvas,
  dbToGain,
  gainToDb,
  useAnalyser,
  useAudioTestMode,
  useFrequencySweep,
  useNoise,
  useTone,
  useVolume,
} from "@webaudio-kit/react";

const waveforms: OscillatorType[] = ["sine", "square", "sawtooth", "triangle"];
const noiseTypes = ["white", "pink", "brown"] as const;

export default function App() {
  const [frequency, setFrequency] = useState(440);
  const [gainDb, setGainDb] = useState(-14);
  const [type, setType] = useState<OscillatorType>("sine");
  const [noiseType, setNoiseType] =
    useState<(typeof noiseTypes)[number]>("white");
  const [pan, setPan] = useState(0);
  const gain = dbToGain(gainDb);
  const noteName = frequencyToNoteName(frequency);
  const tone = useTone({ frequency, gain, type, pan });
  const sweep = useFrequencySweep({
    from: 250,
    to: 8000,
    durationMs: 2400,
    gain,
    type,
    pan,
  });
  const noise = useNoise({
    durationMs: 900,
    gain: Math.min(gain, 0.12),
    pan,
    type: noiseType,
  });
  const volume = useVolume();
  const audioTest = useAudioTestMode();
  const playNoise = () => {
    tone.stop();
    sweep.stop();
    audioTest.stop();
    void noise.play();
  };
  const runTestMode = () => {
    tone.stop();
    sweep.stop();
    noise.stop();
    void audioTest.run();
  };
  const stopAll = () => {
    tone.stop();
    sweep.stop();
    noise.stop();
    audioTest.stop();
  };

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">React + Web Audio primitives</p>
          <h1>Build browser audio interfaces without fighting AudioContext.</h1>
          <p className="lede">
            This demo plays a tone, runs a frequency sweep, creates noise
            bursts, and draws analyser data using webaudio-kit React hooks.
          </p>
        </div>
        <div className="statusPanel">
          <span>Master volume</span>
          <strong>{volume.gain.toFixed(2)}</strong>
          <button type="button" onClick={() => void volume.setGain(0.2)}>
            Reset safe volume
          </button>
        </div>
      </section>

      <section className="toolGrid">
        <div className="panel controlsPanel">
          <div className="panelHead">
            <span>Tone generator</span>
            <strong>
              {frequency} Hz / {noteName}
            </strong>
          </div>

          <label>
            Frequency
            <input
              min="20"
              max="20000"
              onChange={(event) => setFrequency(Number(event.target.value))}
              step="1"
              type="range"
              value={frequency}
            />
          </label>

          <label>
            Gain
            <input
              min="-48"
              max="0"
              onChange={(event) => setGainDb(Number(event.target.value))}
              step="1"
              type="range"
              value={gainDb}
            />
            <span className="hint">
              {gainDb} dB / gain {gain.toFixed(3)} / {gainToDb(gain).toFixed(1)}{" "}
              dB
            </span>
          </label>

          <label>
            Pan
            <input
              min="-1"
              max="1"
              onChange={(event) => setPan(Number(event.target.value))}
              step="0.01"
              type="range"
              value={pan}
            />
          </label>

          <div className="segmented" aria-label="Waveform">
            {waveforms.map((waveform) => (
              <button
                className={waveform === type ? "active" : undefined}
                key={waveform}
                onClick={() => setType(waveform)}
                type="button"
              >
                {waveform}
              </button>
            ))}
          </div>

          <div className="buttonRow">
            <button
              className="primary"
              onClick={() => void tone.play()}
              type="button"
            >
              {tone.isPlaying ? "Restart tone" : "Play tone"}
            </button>
            <button onClick={stopAll} type="button">
              Stop
            </button>
          </div>
        </div>

        <div className="panel sweepPanel">
          <div className="panelHead">
            <span>Frequency sweep</span>
            <strong>250 Hz to 8000 Hz</strong>
          </div>
          <p>
            Sweep playback uses the same provider graph as the tone generator:
            source, gain, pan, analyser, then destination.
          </p>
          <div className="buttonRow">
            <button
              className="primary"
              onClick={() => void sweep.play()}
              type="button"
            >
              {sweep.isPlaying ? "Restart sweep" : "Run sweep"}
            </button>
            <button onClick={stopAll} type="button">
              Stop
            </button>
          </div>
        </div>

        <div className="panel noisePanel">
          <div className="panelHead">
            <span>Noise burst</span>
            <strong>{noiseType}</strong>
          </div>
          <p>
            White, pink, and brown noise are generated into short buffers and
            routed through the same gain, pan, master volume, and analyser path.
          </p>
          <div className="segmented" aria-label="Noise type">
            {noiseTypes.map((nextNoiseType) => (
              <button
                className={nextNoiseType === noiseType ? "active" : undefined}
                key={nextNoiseType}
                onClick={() => setNoiseType(nextNoiseType)}
                type="button"
              >
                {nextNoiseType}
              </button>
            ))}
          </div>
          <div className="buttonRow">
            <button className="primary" onClick={playNoise} type="button">
              {noise.isPlaying ? "Restart noise" : "Play noise"}
            </button>
            <button onClick={stopAll} type="button">
              Stop
            </button>
          </div>
        </div>

        <div className="panel testPanel">
          <div className="panelHead">
            <span>Audio test mode</span>
            <strong>
              {audioTest.currentStep
                ? `Running: ${audioTest.currentStep.label}`
                : "Idle"}
            </strong>
          </div>
          <p>
            Runs a short low-gain sequence through tone, pan, sweep, noise, and
            analyser routing so integration issues show up quickly.
          </p>
          <ol className="stepList">
            {audioTest.steps.map((step, index) => (
              <li
                className={
                  audioTest.currentStepIndex === index ? "active" : undefined
                }
                key={step.id}
              >
                <span>{step.label}</span>
                <small>{step.description}</small>
              </li>
            ))}
          </ol>
          <div className="buttonRow">
            <button className="primary" onClick={runTestMode} type="button">
              {audioTest.isRunning ? "Restart test mode" : "Run test mode"}
            </button>
            <button onClick={audioTest.stop} type="button">
              Stop test mode
            </button>
          </div>
        </div>

        <WaveformPanel />
      </section>

      <p className="disclaimer">
        webaudio-kit is for browser audio interfaces and prototypes. It is not a
        certified audiology or medical testing system.
      </p>
    </main>
  );
}

function WaveformPanel() {
  const analyser = useAnalyser();

  return (
    <div className="panel waveformPanel">
      <div className="panelHead">
        <span>Analyser</span>
        <strong>{analyser ? "live" : "waiting"}</strong>
      </div>
      <span className="visualizerLabel">Waveform</span>
      <WaveformCanvas
        aria-label="Waveform analyser"
        backgroundColor="#10110f"
        height="180"
        strokeColor="#c8ea3a"
        width="720"
      />
      <span className="visualizerLabel">Spectrum</span>
      <SpectrumCanvas
        aria-label="Spectrum analyser"
        backgroundColor="#10110f"
        barColor="#8ed8ff"
        height="140"
        width="720"
      />
    </div>
  );
}
