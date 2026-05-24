"use client";

import {
  AudioProvider,
  SpectrumCanvas,
  WaveformCanvas,
  useFrequencySweep,
  useTone,
} from "@webaudio-kit/react";

function Controls() {
  const tone = useTone({ frequency: 440, gain: 0.15, type: "sine" });
  const sweep = useFrequencySweep({
    from: 250,
    to: 8000,
    durationMs: 2400,
    gain: 0.12,
  });

  return (
    <div>
      <button type="button" onClick={() => void tone.play({ durationMs: 600 })}>
        Play 440 Hz
      </button>
      <button type="button" onClick={tone.stop}>
        Stop
      </button>
      <button type="button" onClick={() => void sweep.play()}>
        Run sweep
      </button>
      <WaveformCanvas
        backgroundColor="#10110f"
        height={140}
        strokeColor="#c8ea3a"
        width={640}
      />
      <SpectrumCanvas
        backgroundColor="#10110f"
        barColor="#8ed8ff"
        height={110}
        width={640}
      />
    </div>
  );
}

export function AudioControls() {
  return (
    <AudioProvider>
      <Controls />
    </AudioProvider>
  );
}
