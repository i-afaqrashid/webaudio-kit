"use client";

import { useState } from "react";
import {
  AudioProvider,
  SpectrumCanvas,
  WaveformCanvas,
  clampFrequency,
  dbToGain,
  frequencyToNoteName,
  gainToDb,
  useAudioContext,
  useFrequencySweep,
  useNoise,
  useTone,
  useVolume,
} from "@webaudio-kit/react";
import type { DemoSlug } from "./demo-pages";

export function FocusedDemoPanel({ slug }: { slug: DemoSlug }) {
  return (
    <AudioProvider>
      <FocusedDemoControls slug={slug} />
    </AudioProvider>
  );
}

function FocusedDemoControls({ slug }: { slug: DemoSlug }) {
  const [pan, setPan] = useState(0);
  const [frequency, setFrequency] = useState(440);
  const audio = useAudioContext();
  const volume = useVolume();
  const tone = useTone({
    durationMs: 700,
    frequency,
    gain: 0.12,
    pan,
    type: "sine",
  });
  const sweep = useFrequencySweep({
    durationMs: 1600,
    from: 180,
    gain: 0.08,
    pan,
    to: 2200,
    type: "triangle",
  });
  const noise = useNoise({
    durationMs: 520,
    gain: 0.05,
    pan,
    type: "pink",
  });

  const stopAll = () => {
    audio.stopAll();
  };
  const boundedFrequency = clampFrequency(frequency);
  const noteName = frequencyToNoteName(boundedFrequency);
  const signal = tone.isPlaying
    ? "tone"
    : sweep.isPlaying
      ? "sweep"
      : noise.isPlaying
        ? "noise"
        : "idle";

  const playTone = async (overrides?: { frequency?: number; pan?: number }) => {
    stopAll();
    await tone.play({
      frequency: overrides?.frequency ?? boundedFrequency,
      pan: overrides?.pan ?? pan,
    });
  };

  const playCombo = async () => {
    stopAll();
    await tone.play({ durationMs: 420, frequency: 523.25, gain: 0.1 });
    await noise.play({ durationMs: 520, gain: 0.04, type: "pink" });
  };

  return (
    <section className="focusedDemoPanel" aria-label="Focused demo controls">
      <div className="focusedDemoHeader">
        <div>
          <span className="kicker">Focused live demo</span>
          <h2>{getFocusedTitle(slug)}</h2>
        </div>
        <div className="recipeDemoState" aria-label="Focused audio state">
          <span>{audio.state}</span>
          <span>{signal}</span>
        </div>
      </div>

      {slug === "visualizer" ? (
        <div className="focusedDemoGrid">
          <div className="focusedControlCard">
            <strong>Pulse analyser routing</strong>
            <p>
              Start a short triangle tone and confirm the shared analyser feeds
              both reusable canvas components.
            </p>
            <div className="demoActions">
              <button
                className="button buttonPrimary"
                onClick={() => void playTone({ frequency: 523.25 })}
                type="button"
              >
                Pulse visualizer
              </button>
              <button className="button" onClick={stopAll} type="button">
                Stop
              </button>
            </div>
          </div>
          <div className="focusedCanvasStack">
            <WaveformCanvas
              aria-label="Focused waveform analyser"
              backgroundColor="#0f120f"
              height="120"
              idleStrokeColor="#394135"
              strokeColor="#b9e145"
              width="720"
            />
            <SpectrumCanvas
              aria-label="Focused spectrum analyser"
              backgroundColor="#0f120f"
              barColor="#8ed8ff"
              height="90"
              idleBarColor="#394135"
              width="720"
            />
          </div>
        </div>
      ) : null}

      {slug === "volume" ? (
        <div className="focusedDemoGrid">
          <div className="focusedControlCard">
            <label className="rangeControl">
              <span>Demo master volume</span>
              <input
                aria-label="Demo master volume"
                max="0.5"
                min="0"
                onChange={(event) =>
                  void volume.setGain(Number(event.currentTarget.value))
                }
                step="0.01"
                type="range"
                value={volume.gain}
              />
              <small>
                gain {volume.gain.toFixed(2)} /{" "}
                {gainToDb(volume.gain).toFixed(1)} dB
              </small>
            </label>
            <div className="demoActions">
              <button
                className="button buttonPrimary"
                onClick={() => void playTone()}
                type="button"
              >
                Play volume reference
              </button>
              <button className="button" onClick={stopAll} type="button">
                Stop
              </button>
            </div>
          </div>
          <MetricStack
            items={[
              ["Default gain", "0.20"],
              ["UI limit", "0.50"],
              ["Current dB", `${gainToDb(volume.gain).toFixed(1)} dB`],
            ]}
          />
        </div>
      ) : null}

      {slug === "pan" ? (
        <div className="focusedDemoGrid">
          <div className="focusedControlCard">
            <label className="rangeControl">
              <span>Stereo pan</span>
              <input
                aria-label="Stereo pan"
                max="1"
                min="-1"
                onChange={(event) => setPan(Number(event.currentTarget.value))}
                step="0.01"
                type="range"
                value={pan}
              />
              <small>{panLabel(pan)}</small>
            </label>
            <div className="demoActions">
              <button
                className="button"
                onClick={() => void playTone({ pan: -1 })}
                type="button"
              >
                Left check
              </button>
              <button
                className="button buttonPrimary"
                onClick={() => void playTone({ pan: 0 })}
                type="button"
              >
                Center check
              </button>
              <button
                className="button"
                onClick={() => void playTone({ pan: 1 })}
                type="button"
              >
                Right check
              </button>
            </div>
          </div>
          <MetricStack
            items={[
              ["Left", "-1"],
              ["Center", "0"],
              ["Right", "1"],
            ]}
          />
        </div>
      ) : null}

      {slug === "pitch" ? (
        <div className="focusedDemoGrid">
          <div className="focusedControlCard">
            <label className="rangeControl">
              <span>Pitch frequency</span>
              <input
                aria-label="Pitch frequency"
                max="1760"
                min="110"
                onChange={(event) =>
                  setFrequency(Number(event.currentTarget.value))
                }
                step="1"
                type="range"
                value={frequency}
              />
              <small>
                {Math.round(boundedFrequency)} Hz / {noteName}
              </small>
            </label>
            <div className="demoActions">
              <button
                className="button buttonPrimary"
                onClick={() => void playTone()}
                type="button"
              >
                Play pitch
              </button>
              <button className="button" onClick={stopAll} type="button">
                Stop
              </button>
            </div>
          </div>
          <MetricStack
            items={[
              ["Note", noteName],
              ["Frequency", `${Math.round(boundedFrequency)} Hz`],
              ["Gain", dbToGain(-18).toFixed(3)],
            ]}
          />
        </div>
      ) : null}

      {slug === "combo" ? (
        <div className="focusedDemoGrid">
          <div className="focusedControlCard">
            <strong>Tone plus short noise burst</strong>
            <p>
              Use one provider for multiple playback hooks and stop everything
              through one control.
            </p>
            <div className="demoActions">
              <button
                className="button buttonPrimary"
                onClick={() => void playCombo()}
                type="button"
              >
                Play combo pattern
              </button>
              <button className="button" onClick={stopAll} type="button">
                Stop combo
              </button>
            </div>
          </div>
          <MetricStack
            items={[
              ["Tone", "523 Hz"],
              ["Noise", "pink"],
              ["Shared stop", "yes"],
            ]}
          />
        </div>
      ) : null}

      {slug === "tone" ||
      slug === "sweep" ||
      slug === "noise" ||
      slug === "test-mode" ? (
        <div className="focusedDemoGrid">
          <div className="focusedControlCard">
            <strong>Use the full workspace below</strong>
            <p>
              This original demo page keeps the complete tone, sweep, noise, and
              test-mode workspace visible after the snippet.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function MetricStack({ items }: { items: [string, string][] }) {
  return (
    <div className="focusedMetricStack">
      {items.map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function getFocusedTitle(slug: DemoSlug) {
  if (slug === "visualizer") {
    return "Visualizer-only signal check";
  }
  if (slug === "volume") {
    return "Bounded master gain control";
  }
  if (slug === "pan") {
    return "Stereo pan checks";
  }
  if (slug === "pitch") {
    return "Pitch helper playback";
  }
  if (slug === "combo") {
    return "Combined hook workflow";
  }
  return "Full workspace preview";
}

function panLabel(value: number) {
  if (value < -0.05) {
    return "left";
  }
  if (value > 0.05) {
    return "right";
  }
  return "center";
}
