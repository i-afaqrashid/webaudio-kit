import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AudioProvider,
  SpectrumCanvas,
  WaveformCanvas,
  dbToGain,
  frequencyToNoteName,
  useFrequencySweep,
  useNoise,
  useTone,
  useVolume,
} from "@webaudio-kit/react";
import "./styles.css";

function AudioWorkbench() {
  const [frequency, setFrequency] = useState(440);
  const [gainDb, setGainDb] = useState(-18);
  const gain = dbToGain(gainDb);
  const tone = useTone({ frequency, gain, type: "sine" });
  const sweep = useFrequencySweep({
    from: 250,
    to: 8000,
    durationMs: 2400,
    gain: 0.1,
  });
  const noise = useNoise({ durationMs: 700, gain: 0.07, type: "pink" });
  const volume = useVolume();

  return (
    <main className="shell">
      <span className="kicker">Vite React</span>
      <h1>Browser audio controls with analyser output.</h1>
      <p>
        This example keeps every playback call inside button handlers so browser
        autoplay policy can allow Web Audio.
      </p>

      <section className="panel" aria-label="Tone controls">
        <label>
          Frequency
          <strong>
            {frequency} Hz / {frequencyToNoteName(frequency)}
          </strong>
          <input
            max="20000"
            min="20"
            onChange={(event) =>
              setFrequency(event.currentTarget.valueAsNumber)
            }
            type="range"
            value={frequency}
          />
        </label>

        <label>
          Tone gain
          <strong>{gainDb} dB</strong>
          <input
            max="-3"
            min="-48"
            onChange={(event) => setGainDb(event.currentTarget.valueAsNumber)}
            type="range"
            value={gainDb}
          />
        </label>

        <label>
          Master volume
          <strong>{volume.gain.toFixed(2)}</strong>
          <input
            max="0.5"
            min="0"
            onChange={(event) =>
              void volume.setGain(event.currentTarget.valueAsNumber)
            }
            step="0.01"
            type="range"
            value={volume.gain}
          />
        </label>

        <div className="actions">
          <button onClick={() => void tone.play()} type="button">
            {tone.isPlaying ? "Restart tone" : "Play tone"}
          </button>
          <button onClick={tone.stop} type="button">
            Stop
          </button>
          <button onClick={() => void sweep.play()} type="button">
            {sweep.isPlaying ? "Restart sweep" : "Run sweep"}
          </button>
          <button onClick={() => void noise.play()} type="button">
            {noise.isPlaying ? "Restart noise" : "Pink noise"}
          </button>
        </div>
      </section>

      <section className="panel" aria-label="Analyser output">
        <WaveformCanvas
          backgroundColor="#10110f"
          height={150}
          strokeColor="#c8ea3a"
          width={720}
        />
        <SpectrumCanvas
          backgroundColor="#10110f"
          barColor="#8ed8ff"
          height={120}
          width={720}
        />
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AudioProvider>
      <AudioWorkbench />
    </AudioProvider>
  </StrictMode>,
);
