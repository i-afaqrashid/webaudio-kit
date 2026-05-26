"use client";

import {
  AudioProvider,
  SpectrumCanvas,
  WaveformCanvas,
  useFrequencySweep,
  useNoise,
  useTone,
  useVolume,
} from "@webaudio-kit/react";

function Controls() {
  const tone = useTone({ frequency: 440, gain: 0.14, type: "sine" });
  const sweep = useFrequencySweep({
    from: 250,
    to: 8000,
    durationMs: 2400,
    gain: 0.1,
  });
  const noise = useNoise({ durationMs: 700, gain: 0.07, type: "pink" });
  const volume = useVolume();

  return (
    <section className="panel" aria-label="Browser audio controls">
      <div className="actions">
        <button
          type="button"
          onClick={() => void tone.play({ durationMs: 700 })}
        >
          {tone.isPlaying ? "Restart tone" : "Play 440 Hz"}
        </button>
        <button type="button" onClick={tone.stop}>
          Stop
        </button>
        <button type="button" onClick={() => void sweep.play()}>
          {sweep.isPlaying ? "Restart sweep" : "Run sweep"}
        </button>
        <button type="button" onClick={() => void noise.play()}>
          {noise.isPlaying ? "Restart noise" : "Pink noise"}
        </button>
      </div>

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
  );
}

export function AudioControls() {
  return (
    <AudioProvider>
      <Controls />
    </AudioProvider>
  );
}
