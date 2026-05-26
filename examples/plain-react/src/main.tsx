import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  AudioProvider,
  SpectrumCanvas,
  WaveformCanvas,
  useTone,
  useVolume,
} from "@webaudio-kit/react";
import "./styles.css";

function PlainReactTone() {
  const tone = useTone({
    frequency: 523.25,
    gain: 0.12,
    type: "triangle",
    durationMs: 650,
  });
  const volume = useVolume();

  return (
    <main className="shell">
      <span className="kicker">Plain React</span>
      <h1>One provider, one hook, one tone button.</h1>
      <p>
        Use this when you only need the smallest possible React integration
        before adding more controls.
      </p>

      <section className="panel" aria-label="Tone controls">
        <button type="button" onClick={() => void tone.play()}>
          {tone.isPlaying ? "Restart C5" : "Play C5"}
        </button>
        <button type="button" onClick={tone.stop}>
          Stop
        </button>
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
      </section>

      <section className="panel" aria-label="Analyser output">
        <WaveformCanvas height={140} width={640} />
        <SpectrumCanvas barCount={32} height={110} width={640} />
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AudioProvider>
      <PlainReactTone />
    </AudioProvider>
  </StrictMode>,
);
