import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AudioProvider,
  SpectrumCanvas,
  WaveformCanvas,
  dbToGain,
  useFrequencySweep,
  useTone,
  useVolume,
} from "@webaudio-kit/react";
import "./styles.css";

function TonePanel() {
  const [frequency, setFrequency] = useState(440);
  const [gainDb, setGainDb] = useState(-16);
  const gain = dbToGain(gainDb);
  const tone = useTone({ frequency, gain, type: "sine" });
  const sweep = useFrequencySweep({
    from: 250,
    to: 8000,
    durationMs: 2400,
    gain,
  });
  const volume = useVolume();

  return (
    <main className="panel">
      <p className="eyebrow">webaudio-kit example</p>
      <h1>Vite tone panel</h1>

      <label>
        Frequency <strong>{frequency} Hz</strong>
        <input
          min="20"
          max="20000"
          onChange={(event) => setFrequency(Number(event.target.value))}
          type="range"
          value={frequency}
        />
      </label>

      <label>
        Gain <strong>{gainDb} dB</strong>
        <input
          min="-48"
          max="0"
          onChange={(event) => setGainDb(Number(event.target.value))}
          type="range"
          value={gainDb}
        />
      </label>

      <div className="actions">
        <button onClick={() => void tone.play()} type="button">
          {tone.isPlaying ? "Restart tone" : "Play tone"}
        </button>
        <button onClick={tone.stop} type="button">
          Stop tone
        </button>
        <button onClick={() => void sweep.play()} type="button">
          {sweep.isPlaying ? "Restart sweep" : "Run sweep"}
        </button>
      </div>

      <p className="note">Master gain: {volume.gain.toFixed(2)}</p>
      <div className="visualizers">
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
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AudioProvider>
      <TonePanel />
    </AudioProvider>
  </StrictMode>,
);
