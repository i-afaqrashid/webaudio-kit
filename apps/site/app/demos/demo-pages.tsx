import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock, IconBadge, PageShell, SectionHeader } from "../components";
import type { IconName } from "../components";
import { InteractiveDemo } from "../InteractiveDemo";
import { FocusedDemoPanel } from "./FocusedDemoPanel";
import { createPageMetadata } from "../metadata";

export type DemoSlug =
  | "combo"
  | "noise"
  | "pan"
  | "pitch"
  | "sweep"
  | "test-mode"
  | "tone"
  | "visualizer"
  | "volume";

type DemoConfig = {
  copy: string;
  icon: IconName;
  label: string;
  slug: DemoSlug;
  snippet: string;
  title: string;
};

export const demos: DemoConfig[] = [
  {
    copy: "Change frequency, gain, pan, and waveform while the analyser confirms the provider graph is live.",
    icon: "sliders",
    label: "Tone demo",
    slug: "tone",
    title: "Tone generator",
    snippet: `import { AudioProvider, useTone } from "@webaudio-kit/react";

function ToneButton() {
  const tone = useTone({
    frequency: 440,
    gain: 0.15,
    type: "sine",
  });

  return (
    <button onClick={() => void tone.play({ durationMs: 600 })}>
      {tone.isPlaying ? "Restart tone" : "Play tone"}
    </button>
  );
}

export function App() {
  return (
    <AudioProvider>
      <ToneButton />
    </AudioProvider>
  );
}`,
  },
  {
    copy: "Run a bounded 250Hz to 8000Hz sweep with the same safe master gain and analyser route.",
    icon: "radio",
    label: "Sweep demo",
    slug: "sweep",
    title: "Frequency sweep",
    snippet: `import { AudioProvider, useFrequencySweep } from "@webaudio-kit/react";

function SweepButton() {
  const sweep = useFrequencySweep({
    from: 250,
    to: 8000,
    durationMs: 2400,
    gain: 0.12,
  });

  return (
    <>
      <button onClick={() => void sweep.play()}>Run sweep</button>
      <button onClick={sweep.stop}>Stop</button>
    </>
  );
}

export function App() {
  return (
    <AudioProvider>
      <SweepButton />
    </AudioProvider>
  );
}`,
  },
  {
    copy: "Trigger short white, pink, or brown noise bursts and watch the waveform and spectrum canvases react.",
    icon: "waves",
    label: "Noise demo",
    slug: "noise",
    title: "Noise burst",
    snippet: `import { AudioProvider, useNoise } from "@webaudio-kit/react";

function NoiseButton() {
  const noise = useNoise({
    type: "pink",
    durationMs: 800,
    gain: 0.08,
  });

  return (
    <>
      <button onClick={() => void noise.play()}>Play pink noise</button>
      <button onClick={noise.stop}>Stop</button>
    </>
  );
}

export function App() {
  return (
    <AudioProvider>
      <NoiseButton />
    </AudioProvider>
  );
}`,
  },
  {
    copy: "Run the short low-gain sequence that checks tone output, stereo pan, sweep scheduling, noise, and analyser routing.",
    icon: "shield",
    label: "Test mode demo",
    slug: "test-mode",
    title: "Audio test mode",
    snippet: `import { AudioProvider, useAudioTestMode } from "@webaudio-kit/react";

function AudioSelfCheck() {
  const testMode = useAudioTestMode();

  return (
    <>
      <button onClick={() => void testMode.run()}>
        {testMode.isRunning ? "Restart test mode" : "Run test mode"}
      </button>
      <button onClick={testMode.stop}>Stop</button>
      <p>{testMode.currentStep?.label ?? "Idle"}</p>
    </>
  );
}

export function App() {
  return (
    <AudioProvider>
      <AudioSelfCheck />
    </AudioProvider>
  );
}`,
  },
  {
    copy: "Render waveform and spectrum canvases as the primary surface with a small pulse control for analyser verification.",
    icon: "activity",
    label: "Visualizer demo",
    slug: "visualizer",
    title: "Visualizer lab",
    snippet: `import {
  AudioProvider,
  SpectrumCanvas,
  WaveformCanvas,
  useTone,
} from "@webaudio-kit/react";

function VisualizerOnly() {
  const tone = useTone({ frequency: 523.25, gain: 0.1, type: "triangle" });

  return (
    <>
      <button onClick={() => void tone.play({ durationMs: 700 })}>
        Pulse visualizer
      </button>
      <WaveformCanvas aria-label="Waveform analyser" />
      <SpectrumCanvas aria-label="Spectrum analyser" />
    </>
  );
}

export function App() {
  return (
    <AudioProvider>
      <VisualizerOnly />
    </AudioProvider>
  );
}`,
  },
  {
    copy: "Expose provider master gain as a bounded UI control and play a reference tone through that shared gain.",
    icon: "volume",
    label: "Volume demo",
    slug: "volume",
    title: "Master volume",
    snippet: `import { AudioProvider, useTone, useVolume } from "@webaudio-kit/react";

function MasterVolumeDemo() {
  const volume = useVolume();
  const tone = useTone({ frequency: 440, gain: 0.12 });

  return (
    <>
      <input
        max={0.5}
        min={0}
        onChange={(event) => void volume.setGain(event.currentTarget.valueAsNumber)}
        step={0.01}
        type="range"
        value={volume.gain}
      />
      <button onClick={() => void tone.play({ durationMs: 700 })}>
        Play volume reference
      </button>
    </>
  );
}

export function App() {
  return (
    <AudioProvider>
      <MasterVolumeDemo />
    </AudioProvider>
  );
}`,
  },
  {
    copy: "Check left, center, and right pan values with short low-gain tones and a visible pan slider.",
    icon: "sliders",
    label: "Pan demo",
    slug: "pan",
    title: "Stereo pan",
    snippet: `import { AudioProvider, useTone } from "@webaudio-kit/react";

function StereoPanChecks() {
  const tone = useTone({ frequency: 660, gain: 0.1, durationMs: 600 });

  return (
    <>
      <button onClick={() => void tone.play({ pan: -1 })}>Left check</button>
      <button onClick={() => void tone.play({ pan: 0 })}>Center check</button>
      <button onClick={() => void tone.play({ pan: 1 })}>Right check</button>
    </>
  );
}

export function App() {
  return (
    <AudioProvider>
      <StereoPanChecks />
    </AudioProvider>
  );
}`,
  },
  {
    copy: "Use frequency clamping and note-name helpers next to playback so pitch UI stays readable.",
    icon: "gauge",
    label: "Pitch demo",
    slug: "pitch",
    title: "Pitch helper",
    snippet: `import {
  AudioProvider,
  clampFrequency,
  frequencyToNoteName,
  useTone,
} from "@webaudio-kit/react";

function PitchHelperDemo({ frequency = 440 }) {
  const safeFrequency = clampFrequency(frequency);
  const tone = useTone({ frequency: safeFrequency, gain: 0.12 });

  return (
    <>
      <span>{frequencyToNoteName(safeFrequency)}</span>
      <button onClick={() => void tone.play({ durationMs: 700 })}>
        Play pitch
      </button>
    </>
  );
}

export function App() {
  return (
    <AudioProvider>
      <PitchHelperDemo />
    </AudioProvider>
  );
}`,
  },
  {
    copy: "Combine tone and noise hooks under one provider to model richer UI feedback with one shared stop control.",
    icon: "zap",
    label: "Combo demo",
    slug: "combo",
    title: "Tone and noise combo",
    snippet: `import { AudioProvider, useNoise, useTone } from "@webaudio-kit/react";

function ComboFeedback() {
  const tone = useTone({ frequency: 523.25, gain: 0.1, durationMs: 420 });
  const noise = useNoise({ type: "pink", durationMs: 520, gain: 0.04 });

  const play = async () => {
    await tone.play();
    await noise.play();
  };

  return (
    <>
      <button onClick={() => void play()}>Play combo pattern</button>
      <button onClick={() => { tone.stop(); noise.stop(); }}>Stop combo</button>
    </>
  );
}

export function App() {
  return (
    <AudioProvider>
      <ComboFeedback />
    </AudioProvider>
  );
}`,
  },
];

export function getDemo(slug: DemoSlug) {
  return demos.find((demo) => demo.slug === slug)!;
}

export function getDemoMetadata(slug: DemoSlug): Metadata {
  const demo = getDemo(slug);

  return createPageMetadata({
    title: demo.title,
    description: demo.copy,
    path: `/demos/${slug}`,
  });
}

export function DemoIndex() {
  return (
    <PageShell active="demos">
      <main>
        <section className="docHero">
          <div className="wrap">
            <span className="kicker">Interactive demos</span>
            <h1>Focused browser audio workspaces.</h1>
            <p>
              Open a direct demo for tone generation, sweeps, noise, test mode,
              visualizer components, master volume, stereo pan, pitch helpers,
              or combined hook workflows.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="demoCardGrid">
              {demos.map((demo) => (
                <Link
                  className="demoCard"
                  href={`/demos/${demo.slug}`}
                  key={demo.slug}
                >
                  <IconBadge name={demo.icon} />
                  <span className="kicker">{demo.label}</span>
                  <h2>{demo.title}</h2>
                  <p>{demo.copy}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section demoSection">
          <div className="wrap">
            <SectionHeader
              kicker="Full workspace"
              title="Try every control together."
              copy="The shared demo keeps tone, sweep, noise, test mode, volume, pan, waveform, and spectrum output in one place."
            />
            <div className="docActionLinks demoIntroLinks">
              <Link className="button" href="/docs/api">
                API reference
              </Link>
              <Link className="button" href="/docs">
                Implementation docs
              </Link>
            </div>
            <InteractiveDemo />
          </div>
        </section>
      </main>
    </PageShell>
  );
}

export function DemoDetail({ slug }: { slug: DemoSlug }) {
  const demo = getDemo(slug);

  return (
    <PageShell active="demos">
      <main>
        <section className="docHero demoDetailHero">
          <div className="wrap">
            <span className="kicker">{demo.label}</span>
            <h1>{demo.title}.</h1>
            <p>{demo.copy}</p>
            <div className="heroActions">
              <Link className="button buttonPrimary" href="/demos">
                All demos
              </Link>
              <Link className="button" href="/docs">
                Docs
              </Link>
              <Link className="button" href="/docs/recipes">
                Recipes
              </Link>
              <Link className="button" href="/docs/examples">
                Examples
              </Link>
              <Link className="button" href="/docs/api">
                API reference
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap demoDetailLayout">
            <div>
              <SectionHeader
                kicker="Copy-paste"
                title="Use this in a React component."
                copy="Keep playback inside a user action. The provider creates AudioContext lazily and routes playback through the safe graph."
              />
              <CodeBlock title={`${demo.slug}.tsx`}>{demo.snippet}</CodeBlock>
            </div>
            <div className="demoLinkPanel">
              <span className="kicker">Related demos</span>
              {demos.map((item) => (
                <Link
                  className={item.slug === slug ? "active" : undefined}
                  href={`/demos/${item.slug}`}
                  key={item.slug}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section demoSection">
          <div className="wrap">
            <SectionHeader
              kicker="Focused controls"
              title="Run the focused surface."
              copy="Each page keeps one primary workflow near the snippet, then leaves the full workspace below for broader testing."
            />
            <FocusedDemoPanel slug={slug} />
          </div>
        </section>

        <section className="section demoSection">
          <div className="wrap">
            <SectionHeader
              kicker="Full workspace"
              title="Try every control together."
              copy="Use the shared workspace when you want tone, sweep, noise, test mode, volume, pan, waveform, and spectrum controls on one screen."
            />
            <InteractiveDemo />
          </div>
        </section>
      </main>
    </PageShell>
  );
}
