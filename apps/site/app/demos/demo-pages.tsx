import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock, IconBadge, PageShell, SectionHeader } from "../components";
import type { IconName } from "../components";
import { InteractiveDemo } from "../InteractiveDemo";

export type DemoSlug = "tone" | "sweep" | "noise" | "test-mode";

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
];

export function getDemo(slug: DemoSlug) {
  return demos.find((demo) => demo.slug === slug)!;
}

export function getDemoMetadata(slug: DemoSlug): Metadata {
  const demo = getDemo(slug);

  return {
    title: demo.title,
    description: `${demo.label} for webaudio-kit React browser audio prototypes.`,
  };
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
              Open a direct demo for tone generation, frequency sweeps, noise
              bursts, or test mode. Each page keeps the full analyser-backed
              demo nearby so behavior is visible while you read.
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
              kicker="Live controls"
              title="Run it in the browser."
              copy="The same component drives all focused demo pages, so you can move between docs and demos without losing the full workspace."
            />
            <InteractiveDemo />
          </div>
        </section>
      </main>
    </PageShell>
  );
}
