import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock, PageShell, SectionHeader } from "../../components";
import { createPageMetadata } from "../../metadata";
import { playgroundExamples } from "../../playground-links";

const description =
  "Standalone webaudio-kit example apps for Vite React, Next App Router, plain React, and audio test mode.";

export const metadata: Metadata = createPageMetadata({
  title: "Examples",
  description,
  path: "/docs/examples",
});

const examples = [
  {
    path: "examples/vite-react",
    title: "Vite React",
    copy: "Main tone, sweep, noise, volume, waveform, and spectrum example for client-side React apps.",
    command: `cd examples/vite-react
pnpm install
pnpm dev`,
    snippetPath: "examples/vite-react/src/main.tsx",
    snippetSourceUrl:
      "https://github.com/i-afaqrashid/webaudio-kit/blob/main/examples/vite-react/src/main.tsx",
    snippetTitle: "Vite React source excerpt",
    sourceLabel: "vite-react",
    snippet: `function AudioWorkbench() {
  const [frequency, setFrequency] = useState(440);
  const tone = useTone({ frequency, gain: dbToGain(-18), type: "sine" });
  const sweep = useFrequencySweep({ from: 250, to: 8000, durationMs: 2400 });
  const noise = useNoise({ durationMs: 700, gain: 0.07, type: "pink" });
  const volume = useVolume();

  return (
    <>
      <button onClick={() => void tone.play()}>Play tone</button>
      <button onClick={() => void sweep.play()}>Run sweep</button>
      <button onClick={() => void noise.play()}>Pink noise</button>
      <input
        max="0.5"
        min="0"
        onChange={(event) => void volume.setGain(event.currentTarget.valueAsNumber)}
        type="range"
        value={volume.gain}
      />
      <WaveformCanvas backgroundColor="#10110f" strokeColor="#c8ea3a" />
      <SpectrumCanvas backgroundColor="#10110f" barColor="#8ed8ff" />
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <AudioProvider>
    <AudioWorkbench />
  </AudioProvider>,
);`,
  },
  {
    path: "examples/next-app-router",
    title: "Next App Router",
    copy: "Server page with a client component boundary for AudioProvider, hooks, and visualizer canvases.",
    command: `cd examples/next-app-router
pnpm install
pnpm dev`,
    snippetPath: "examples/next-app-router/app/audio-controls.tsx",
    snippetSourceUrl:
      "https://github.com/i-afaqrashid/webaudio-kit/blob/main/examples/next-app-router/app/audio-controls.tsx",
    snippetTitle: "Next App Router source excerpt",
    sourceLabel: "next-app-router",
    snippet: `"use client";

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
  const sweep = useFrequencySweep({ from: 250, to: 8000, durationMs: 2400 });
  const noise = useNoise({ durationMs: 700, gain: 0.07, type: "pink" });
  const volume = useVolume();

  return (
    <section aria-label="Browser audio controls">
      <button onClick={() => void tone.play({ durationMs: 700 })}>
        Play 440 Hz
      </button>
      <button onClick={() => void sweep.play()}>Run sweep</button>
      <button onClick={() => void noise.play()}>Pink noise</button>
      <input
        max="0.5"
        min="0"
        onChange={(event) => void volume.setGain(event.currentTarget.valueAsNumber)}
        step="0.01"
        type="range"
        value={volume.gain}
      />
      <WaveformCanvas />
      <SpectrumCanvas />
    </section>
  );
}

export function AudioControls() {
  return (
    <AudioProvider>
      <Controls />
    </AudioProvider>
  );
}`,
  },
  {
    path: "examples/plain-react",
    title: "Plain React",
    copy: "Smallest provider, tone, volume, waveform, and spectrum setup.",
    command: `cd examples/plain-react
pnpm install
pnpm dev`,
    snippetPath: "examples/plain-react/src/main.tsx",
    snippetSourceUrl:
      "https://github.com/i-afaqrashid/webaudio-kit/blob/main/examples/plain-react/src/main.tsx",
    snippetTitle: "Plain React source excerpt",
    sourceLabel: "plain-react",
    snippet: `function App() {
  const tone = useTone({ frequency: 440, gain: 0.14, type: "sine" });
  const volume = useVolume();

  return (
    <AudioProvider>
      <button onClick={() => void tone.play({ durationMs: 600 })}>
        Play tone
      </button>
      <input
        max="0.5"
        min="0"
        onChange={(event) => void volume.setGain(event.currentTarget.valueAsNumber)}
        type="range"
        value={volume.gain}
      />
      <WaveformCanvas />
      <SpectrumCanvas />
    </AudioProvider>
  );
}`,
  },
  {
    path: "examples/incident-alert-console",
    title: "Incident Alert Console",
    copy: "Product-style monitoring console with severity cues, master volume, audio state, waveform, and spectrum output.",
    command: `cd examples/incident-alert-console
pnpm install
pnpm dev`,
    snippetPath: "examples/incident-alert-console/src/main.tsx",
    snippetSourceUrl:
      "https://github.com/i-afaqrashid/webaudio-kit/blob/main/examples/incident-alert-console/src/main.tsx",
    snippetTitle: "Incident console source excerpt",
    sourceLabel: "incident-alert-console",
    snippet: `function IncidentConsole() {
  const audio = useAudioContext();
  const warningTone = useTone({ frequency: 880, gain: 0.11 });
  const criticalSweep = useFrequencySweep({
    durationMs: 700,
    from: 520,
    to: 1800,
    type: "sawtooth",
  });

  function stopAllLocalCues() {
    audio.stopAll();
  }

  return (
    <section aria-label="Audio runtime controls">
      <button onClick={() => void audio.ensureAudioContext()}>
        Enable audio
      </button>
      <button onClick={() => void warningTone.play()}>Warning cue</button>
      <button onClick={() => void criticalSweep.play()}>Critical cue</button>
      <button onClick={stopAllLocalCues}>Stop cues</button>
      <WaveformCanvas idleStrokeColor="#384235" />
      <SpectrumCanvas idleBarColor="#384235" />
    </section>
  );
}`,
  },
  {
    path: "examples/audio-test-mode",
    title: "Audio test mode",
    copy: "Low-gain diagnostic sequence with analyser output and manual stop controls.",
    command: `cd examples/audio-test-mode
pnpm install
pnpm dev`,
    snippetPath: "examples/audio-test-mode/src/main.tsx",
    snippetSourceUrl:
      "https://github.com/i-afaqrashid/webaudio-kit/blob/main/examples/audio-test-mode/src/main.tsx",
    snippetTitle: "Audio test mode source excerpt",
    sourceLabel: "audio-test-mode",
    snippet: `function AudioSelfCheck() {
  const testMode = useAudioTestMode();

  return (
    <AudioProvider>
      <p>{testMode.currentStep?.label ?? "Idle"}</p>
      <button onClick={() => void testMode.run()}>Run test mode</button>
      <button onClick={testMode.stop}>Stop</button>
      <WaveformCanvas />
      <SpectrumCanvas />
    </AudioProvider>
  );
}`,
  },
];

export default function ExampleDocsPage() {
  return (
    <PageShell active="examples">
      <main className="docPage">
        <section className="docHero">
          <div className="wrap">
            <span className="kicker">Examples</span>
            <h1>Standalone example apps.</h1>
            <p>
              Small framework examples that use normal published package ranges
              and are checked from packed tarballs before release.
            </p>
            <div className="heroActions">
              <Link className="button buttonPrimary" href="/docs/recipes">
                Recipes
              </Link>
              <Link className="button" href="/docs/frameworks">
                Framework comparison
              </Link>
              <Link className="button" href="/docs/api">
                API reference
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap docLayout">
            <aside className="toc" aria-label="Example sections">
              <a href="#check">Check examples</a>
              {examples.map((example) => (
                <a href={`#${slugify(example.path)}`} key={example.path}>
                  {example.title}
                </a>
              ))}
            </aside>

            <article className="docContent">
              <SectionHeader
                kicker="Frameworks"
                title="Build against packed packages."
                copy="The examples are outside the pnpm workspace on purpose. The checker copies each one into a temporary folder, installs packed package tarballs, and runs the example build."
              />

              <h2 id="check">Check examples</h2>
              <CodeBlock title="repo check">{`pnpm examples:check`}</CodeBlock>

              <h2 id="run-in-browser">Run in browser</h2>
              <p>
                These links open standalone GitHub example folders in
                StackBlitz. The repository remains the source of truth, so the
                browser examples follow the same package files that CI checks.
              </p>
              <div className="exampleDocList">
                {playgroundExamples.map((example) => (
                  <article className="exampleDocItem" key={example.path}>
                    <div>
                      <span className="kicker">{example.path}</span>
                      <h3>{example.title}</h3>
                      <p>{example.copy}</p>
                    </div>
                    <a
                      className="button buttonPrimary"
                      href={example.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Run in StackBlitz
                    </a>
                  </article>
                ))}
              </div>

              <div className="exampleDocList">
                {examples.map((example) => (
                  <article
                    className="exampleDocItem"
                    id={slugify(example.path)}
                    key={example.path}
                  >
                    <div>
                      <span className="kicker">{example.path}</span>
                      <h3>{example.title}</h3>
                      <p>{example.copy}</p>
                    </div>
                    <CodeBlock title="run locally">{example.command}</CodeBlock>
                    <CodeBlock title={example.snippetTitle}>
                      {example.snippet}
                    </CodeBlock>
                    <a
                      className="button"
                      href={example.snippetSourceUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      View {example.sourceLabel} source
                    </a>
                  </article>
                ))}
              </div>

              <h2 id="related">Related docs</h2>
              <div className="docActionLinks">
                <Link className="button buttonPrimary" href="/docs/recipes">
                  Recipes
                </Link>
                <Link className="button" href="/docs/frameworks">
                  Framework comparison
                </Link>
                <Link className="button" href="/docs">
                  Docs guide
                </Link>
                <a
                  className="button"
                  href="https://github.com/i-afaqrashid/webaudio-kit/tree/main/examples"
                  rel="noreferrer"
                  target="_blank"
                >
                  GitHub examples
                </a>
              </div>
            </article>
          </div>
        </section>
      </main>
    </PageShell>
  );
}

function slugify(value: string) {
  return value.replaceAll("/", "-");
}
