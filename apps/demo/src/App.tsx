import { useEffect, useRef, useState } from "react";
import {
  dbToGain,
  gainToDb,
  useAnalyser,
  useFrequencySweep,
  useTone,
  useVolume,
} from "@webaudio-kit/react";

const waveforms: OscillatorType[] = ["sine", "square", "sawtooth", "triangle"];

export default function App() {
  const [frequency, setFrequency] = useState(440);
  const [gainDb, setGainDb] = useState(-14);
  const [type, setType] = useState<OscillatorType>("sine");
  const [pan, setPan] = useState(0);
  const gain = dbToGain(gainDb);
  const tone = useTone({ frequency, gain, type, pan });
  const sweep = useFrequencySweep({
    from: 250,
    to: 8000,
    durationMs: 2400,
    gain,
    type,
    pan,
  });
  const volume = useVolume();

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">React + Web Audio primitives</p>
          <h1>Build browser audio interfaces without fighting AudioContext.</h1>
          <p className="lede">
            This demo plays a tone, runs a frequency sweep, and draws analyser
            data using the first webaudio-kit React hooks.
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
            <strong>{frequency} Hz</strong>
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
            <button onClick={tone.stop} type="button">
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
            <button onClick={sweep.stop} type="button">
              Stop
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const data = new Uint8Array(analyser.fftSize);
    let frame = 0;

    const draw = () => {
      frame = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(data);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#10110f";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.strokeStyle = "#c8ea3a";
      context.lineWidth = 2;
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
    };

    draw();

    return () => cancelAnimationFrame(frame);
  }, [analyser]);

  return (
    <div className="panel waveformPanel">
      <div className="panelHead">
        <span>Analyser</span>
        <strong>{analyser ? "live" : "waiting"}</strong>
      </div>
      <canvas
        aria-label="Waveform analyser"
        height="180"
        ref={canvasRef}
        width="720"
      />
    </div>
  );
}
