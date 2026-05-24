import Link from "next/link";
import {
  CodeBlock,
  GitHubMark,
  IconBadge,
  PageShell,
  SectionHeader,
  Terminal,
} from "./components";
import { InteractiveDemo } from "./InteractiveDemo";

const packages = [
  {
    icon: "package" as const,
    name: "@webaudio-kit/core",
    copy: "Browser-safe playback helpers, math utilities, frequency clamping, and per-call node cleanup.",
  },
  {
    icon: "waves" as const,
    name: "@webaudio-kit/react",
    copy: "AudioProvider plus hooks for tones, sweeps, master volume, context state, and analyser access.",
  },
  {
    icon: "terminal" as const,
    name: "apps/demo",
    copy: "A Vite React sandbox for manually testing tone generation, sweeps, pan, gain, and waveform output.",
  },
];

const proofPoints = [
  {
    label: "Runtime",
    title: "No import-time AudioContext",
    copy: "AudioContext is created lazily after user interaction so React apps avoid browser autoplay violations.",
  },
  {
    label: "Safety",
    title: "Safe first-run volume",
    copy: "The provider starts with a 0.2 master gain and examples keep gain controls bounded.",
  },
  {
    label: "Signal",
    title: "Visible analyser signal",
    copy: "The demo draws analyser data so developers can verify the provider graph is live.",
  },
  {
    label: "Release",
    title: "Release smoke checks",
    copy: "Package tarballs are built and reinstalled before publish so exports match the public API.",
  },
];

export default function HomePage() {
  return (
    <PageShell active="home">
      <main>
        <section className="hero">
          <div className="wrap heroGrid">
            <div className="heroCopy">
              <span className="kicker">React Web Audio Toolkit</span>
              <h1>Browser tones and sweeps without fighting AudioContext.</h1>
              <p>
                webaudio-kit is a small React + TypeScript package set for tone
                generators, frequency sweeps, safe volume defaults, and
                analyser-driven UI in browser prototypes.
              </p>
              <div className="heroActions">
                <Link className="button buttonPrimary" href="/docs">
                  Read docs
                </Link>
                <a
                  className="button"
                  href="https://github.com/i-afaqrashid/webaudio-kit"
                  rel="noreferrer"
                  target="_blank"
                >
                  <GitHubMark />
                  GitHub
                </a>
              </div>
              <div className="installPill" aria-label="Install command">
                <span>$</span>
                <code>pnpm add @webaudio-kit/react @webaudio-kit/core</code>
              </div>
            </div>
            <InteractiveDemo />
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <SectionHeader
              kicker="30-second setup"
              title="Wrap the app, then call a hook."
              copy="The public API stays intentionally small for the first production release."
            />
            <CodeBlock title="App.tsx">{`import { AudioProvider, useTone } from "@webaudio-kit/react";

function ToneButton() {
  const tone = useTone({ frequency: 440, gain: 0.15, type: "sine" });

  return (
    <button type="button" onClick={() => void tone.play({ durationMs: 600 })}>
      Play 440 Hz
    </button>
  );
}

export function App() {
  return (
    <AudioProvider>
      <ToneButton />
    </AudioProvider>
  );
}`}</CodeBlock>
          </div>
        </section>

        <section className="section sectionMuted">
          <div className="wrap">
            <SectionHeader
              kicker="Packages"
              title="Narrow packages with clear ownership."
            />
            <div className="packageGrid">
              {packages.map((item) => (
                <article className="infoCard" key={item.name}>
                  <IconBadge name={item.icon} />
                  <h3>{item.name}</h3>
                  <p>{item.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap split">
            <div>
              <SectionHeader
                kicker="Manual proof"
                title="The demo exercises the real provider graph."
                copy="Tone and sweep nodes feed the master gain, analyser, then destination. The waveform should move while sound is playing."
              />
              <div className="proofGrid">
                {proofPoints.map((item, index) => (
                  <article className="proofItem" key={item.title}>
                    <span className="proofIndex">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <span className="proofLabel">{item.label}</span>
                      <h3>{item.title}</h3>
                      <p>{item.copy}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <Terminal title="local verification">
              <span className="terminalMuted">$</span> pnpm verify{"\n"}
              <span className="terminalOk">tests pass</span>
              {"\n"}
              <span className="terminalOk">types pass</span>
              {"\n"}
              <span className="terminalOk">packages build</span>
              {"\n"}
              <span className="terminalOk">demo and site build</span>
              {"\n"}
              <span className="terminalOk">lint and format pass</span>
            </Terminal>
          </div>
        </section>

        <section className="section sectionSafety">
          <div className="wrap scopeNote">
            <div>
              <span className="kicker">Scope boundary</span>
              <h2>Browser audio prototype, not medical software.</h2>
            </div>
            <div>
              <p>
                webaudio-kit can help build audible UI controls and prototypes.
                It is not certified audiology software, and it should not be
                used to diagnose hearing conditions or replace calibrated test
                equipment.
              </p>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
