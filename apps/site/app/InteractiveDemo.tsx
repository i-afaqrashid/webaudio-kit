"use client";

import { useState } from "react";
import {
  AudioProvider,
  WaveformCanvas as AudioWaveformCanvas,
  dbToGain,
  gainToDb,
  useAnalyser,
  useAudioContext,
  useFrequencySweep,
  useTone,
  useVolume,
} from "@webaudio-kit/react";

const waveforms: OscillatorType[] = ["sine", "square", "sawtooth", "triangle"];

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
  const gain = dbToGain(gainDb);
  const audio = useAudioContext();
  const volume = useVolume();
  const tone = useTone({ frequency, gain, pan, type });
  const sweep = useFrequencySweep({
    from: 250,
    to: 8000,
    durationMs: 2400,
    gain,
    pan,
    type,
  });

  const playTone = async () => {
    sweep.stop();
    await tone.play();
  };

  const runSweep = async () => {
    tone.stop();
    await sweep.play();
  };

  const stopAll = () => {
    tone.stop();
    sweep.stop();
  };
  const signalState = tone.isPlaying
    ? "tone"
    : sweep.isPlaying
      ? "sweep"
      : "idle";

  return (
    <div className="demoShell" aria-label="Interactive Web Audio demo">
      <div className="demoHeader">
        <div>
          <span className="kicker">Live demo</span>
          <h2>Play a tone. Sweep a range. Watch the graph move.</h2>
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

      <div className="demoControls">
        <div className="controlPanel">
          <div className="controlHead">
            <span>Tone generator</span>
            <strong>{frequency} Hz</strong>
          </div>

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
              {gainDb} dB / gain {gain.toFixed(3)} / {gainToDb(gain).toFixed(1)}{" "}
              dB
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

          <div className="segmentedControl" aria-label="Waveform">
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

        <div className="controlPanel sweepControls">
          <div className="controlHead">
            <span>Frequency sweep</span>
            <strong>250 Hz to 8000 Hz</strong>
          </div>
          <p>
            The sweep uses the same graph as the tone control: oscillator, gain,
            panner, master volume, analyser, then destination.
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
          <label className="rangeControl compact">
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
      </div>

      <WaveformPanel />
    </div>
  );
}

function WaveformPanel() {
  const analyser = useAnalyser();

  return (
    <div className="waveformFrame">
      <div className="controlHead">
        <span>Analyser</span>
        <strong>{analyser ? "live" : "waiting for click"}</strong>
      </div>
      <AudioWaveformCanvas
        aria-label="Waveform analyser"
        backgroundColor="#0f120f"
        height="180"
        idleStrokeColor="#394135"
        strokeColor="#b9e145"
        width="900"
      />
    </div>
  );
}
