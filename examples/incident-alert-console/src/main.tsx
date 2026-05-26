import { StrictMode, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AudioProvider,
  SpectrumCanvas,
  WaveformCanvas,
  useAudioContext,
  useFrequencySweep,
  useNoise,
  useTone,
  useVolume,
} from "@webaudio-kit/react";
import "./styles.css";

type Severity = "healthy" | "info" | "warning" | "critical" | "resolved";

const incidents: Array<{
  errorRate: string;
  id: string;
  latency: string;
  service: string;
  severity: Severity;
  status: string;
}> = [
  {
    errorRate: "0.02%",
    id: "api",
    latency: "81 ms",
    service: "API gateway",
    severity: "healthy",
    status: "Nominal",
  },
  {
    errorRate: "0.8%",
    id: "search",
    latency: "231 ms",
    service: "Search indexing",
    severity: "warning",
    status: "Queue lag rising",
  },
  {
    errorRate: "4.6%",
    id: "checkout",
    latency: "690 ms",
    service: "Checkout",
    severity: "critical",
    status: "Payment failures",
  },
  {
    errorRate: "0.0%",
    id: "cdn",
    latency: "42 ms",
    service: "CDN edge",
    severity: "resolved",
    status: "Recovered",
  },
];

function IncidentConsole() {
  const audio = useAudioContext();
  const volume = useVolume();
  const [selected, setSelected] = useState(incidents[2]!);
  const [muted, setMuted] = useState(false);
  const pendingCueTimers = useRef<number[]>([]);

  const infoTone = useTone({
    durationMs: 160,
    frequency: 660,
    gain: 0.09,
    type: "sine",
  });
  const warningTone = useTone({
    durationMs: 220,
    frequency: 880,
    gain: 0.11,
    type: "triangle",
  });
  const criticalSweep = useFrequencySweep({
    durationMs: 700,
    from: 520,
    gain: 0.12,
    to: 1800,
    type: "sawtooth",
  });
  const resolvedSweep = useFrequencySweep({
    durationMs: 520,
    from: 900,
    gain: 0.08,
    to: 360,
    type: "sine",
  });
  const noise = useNoise({ durationMs: 180, gain: 0.04, type: "pink" });

  const activeCue = useMemo(() => {
    if (muted) {
      return "Muted";
    }

    return selected.severity === "healthy"
      ? "No cue"
      : `${selected.severity} cue`;
  }, [muted, selected.severity]);

  async function fireCue(severity: Severity) {
    if (muted || severity === "healthy") {
      stopAllLocalCues();
      return;
    }

    stopAllLocalCues();

    if (severity === "info") {
      await infoTone.play();
      return;
    }

    if (severity === "warning") {
      await warningTone.play();
      scheduleCue(() => void warningTone.play({ frequency: 1040 }), 260);
      return;
    }

    if (severity === "critical") {
      await criticalSweep.play();
      scheduleCue(() => void noise.play(), 140);
      return;
    }

    await resolvedSweep.play();
  }

  function scheduleCue(callback: () => void, delayMs: number) {
    const timer = window.setTimeout(() => {
      pendingCueTimers.current = pendingCueTimers.current.filter(
        (value) => value !== timer,
      );
      callback();
    }, delayMs);
    pendingCueTimers.current.push(timer);
  }

  function stopAllLocalCues() {
    for (const timer of pendingCueTimers.current) {
      window.clearTimeout(timer);
    }
    pendingCueTimers.current = [];
    audio.stopAll();
  }

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">webaudio-kit example</p>
        <h1>Incident Alert Console</h1>
        <p className="lede">
          A monitoring dashboard pattern where generated browser cues indicate
          service health changes and the analyser confirms audio activity.
        </p>
      </section>

      <section className="toolbar" aria-label="Audio runtime controls">
        <button onClick={() => void audio.ensureAudioContext()} type="button">
          Enable audio
        </button>
        <button
          aria-pressed={muted}
          onClick={() => setMuted((value) => !value)}
          type="button"
        >
          {muted ? "Unmute cues" : "Mute cues"}
        </button>
        <button onClick={stopAllLocalCues} type="button">
          Stop cues
        </button>
        <label>
          Volume
          <strong>{volume.gain.toFixed(2)}</strong>
          <input
            max="0.4"
            min="0"
            onChange={(event) =>
              void volume.setGain(event.currentTarget.valueAsNumber)
            }
            step="0.01"
            type="range"
            value={volume.gain}
          />
        </label>
        <div className="state">
          <span>Audio state</span>
          <strong>{audio.state}</strong>
        </div>
      </section>

      <section className="grid" aria-label="Incident dashboard">
        <div className="panel">
          <div className="panelHead">
            <span>Services</span>
            <strong>{activeCue}</strong>
          </div>
          <div className="incidentList">
            {incidents.map((incident) => (
              <button
                className={`incident ${incident.severity}`}
                key={incident.id}
                onClick={() => {
                  setSelected(incident);
                  void fireCue(incident.severity);
                }}
                type="button"
              >
                <span>
                  <strong>{incident.service}</strong>
                  <small>{incident.status}</small>
                </span>
                <em>{incident.severity}</em>
              </button>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panelHead">
            <span>Selected incident</span>
            <strong>{selected.service}</strong>
          </div>
          <dl className="metrics">
            <div>
              <dt>Status</dt>
              <dd>{selected.status}</dd>
            </div>
            <div>
              <dt>Latency</dt>
              <dd>{selected.latency}</dd>
            </div>
            <div>
              <dt>Error rate</dt>
              <dd>{selected.errorRate}</dd>
            </div>
          </dl>
          <button
            className="primary"
            onClick={() => void fireCue(selected.severity)}
            type="button"
          >
            Replay selected cue
          </button>
        </div>
      </section>

      <section className="panel analyser" aria-label="Analyser output">
        <WaveformCanvas
          backgroundColor="#10110f"
          height={150}
          idleStrokeColor="#384235"
          strokeColor="#c8ea3a"
          width={720}
        />
        <SpectrumCanvas
          backgroundColor="#10110f"
          barColor="#8ed8ff"
          height={120}
          idleBarColor="#384235"
          width={720}
        />
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AudioProvider initialGain={0.18}>
      <IncidentConsole />
    </AudioProvider>
  </StrictMode>,
);
