"use client";

import { useEffect, useRef, useState } from "react";
import {
  AudioProvider,
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

      <WaveformCanvas />
    </div>
  );
}

function WaveformCanvas() {
  const analyser = useAnalyser();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const data = new Uint8Array(analyser?.fftSize ?? 2048);
    let frame = 0;

    const draw = () => {
      frame = requestAnimationFrame(draw);
      if (analyser) {
        analyser.getByteTimeDomainData(data);
      } else {
        data.fill(128);
      }

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#0f120f";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.strokeStyle = "#b9e145";
      context.lineWidth = 2;
      context.beginPath();

      const slice = canvas.width / data.length;
      for (let index = 0; index < data.length; index += 1) {
        const x = index * slice;
        const centered = (data[index] - 128) * 2.4;
        const y = canvas.height / 2 + (centered / 128) * (canvas.height / 2);
        if (index === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      }

      context.stroke();
    };

    draw();

    return () => cancelAnimationFrame(frame);
  }, [analyser]);

  return (
    <div className="waveformFrame">
      <div className="controlHead">
        <span>Analyser</span>
        <strong>{analyser ? "live" : "waiting for click"}</strong>
      </div>
      <canvas
        aria-label="Waveform analyser"
        height="180"
        ref={canvasRef}
        width="900"
      />
    </div>
  );
}
