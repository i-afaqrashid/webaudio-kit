import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  AudioProvider,
  SpectrumCanvas,
  WaveformCanvas,
  useAudioTestMode,
  useVolume,
} from "@webaudio-kit/react";
import "./styles.css";

function AudioTestModeExample() {
  const testMode = useAudioTestMode();
  const volume = useVolume();

  return (
    <main className="shell">
      <p className="eyebrow">webaudio-kit example</p>
      <h1>Audio test mode</h1>
      <p className="lede">
        Run a conservative sequence that checks tone output, stereo pan, sweep
        scheduling, noise buffers, and analyser routing.
      </p>

      <section className="panel">
        <div className="panelHead">
          <span>Current step</span>
          <strong>{testMode.currentStep?.label ?? "Idle"}</strong>
        </div>

        <ol className="steps">
          {testMode.steps.map((step, index) => (
            <li
              className={
                testMode.currentStepIndex === index ? "active" : undefined
              }
              key={step.id}
            >
              <strong>{step.label}</strong>
              <span>{step.description}</span>
            </li>
          ))}
        </ol>

        <div className="actions">
          <button onClick={() => void testMode.run()} type="button">
            {testMode.isRunning ? "Restart test mode" : "Run test mode"}
          </button>
          <button onClick={testMode.stop} type="button">
            Stop
          </button>
          <button onClick={() => void volume.setGain(0.2)} type="button">
            Reset volume
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="panelHead">
          <span>Master gain</span>
          <strong>{volume.gain.toFixed(2)}</strong>
        </div>
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

      <p className="note">
        Prototype only. This is not medical or audiology software.
      </p>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AudioProvider>
      <AudioTestModeExample />
    </AudioProvider>
  </StrictMode>,
);
