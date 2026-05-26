import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock, IconBadge, PageShell, SectionHeader } from "../components";
import { createPageMetadata } from "../metadata";

const description =
  "Install webaudio-kit, wire AudioProvider, use tone, sweep, and noise hooks, and understand browser audio safety constraints.";

export const metadata: Metadata = createPageMetadata({
  title: "Docs",
  description,
  path: "/docs",
});

const apiCards = [
  {
    icon: "waves" as const,
    title: "AudioProvider",
    copy: "Creates AudioContext lazily, owns master gain, connects analyser, and exposes audio state to hooks.",
  },
  {
    icon: "sliders" as const,
    title: "useTone",
    copy: "Plays oscillator cues with gain, pan, waveform, duration, envelope, filter, detune, voice, and repeat controls.",
  },
  {
    icon: "radio" as const,
    title: "useFrequencySweep",
    copy: "Ramps frequency between two clamped values over a controlled duration.",
  },
  {
    icon: "waves" as const,
    title: "useNoise",
    copy: "Plays short white, pink, or brown noise buffers through the provider graph.",
  },
  {
    icon: "shield" as const,
    title: "useAudioTestMode",
    copy: "Runs short low-gain checks for tone, pan, sweep, noise, and analyser routing.",
  },
  {
    icon: "activity" as const,
    title: "useAnalyser",
    copy: "Returns the analyser node so UI can render waveform or spectrum data.",
  },
  {
    icon: "waves" as const,
    title: "WaveformCanvas",
    copy: "Draws provider analyser data with an idle line before playback starts.",
  },
  {
    icon: "activity" as const,
    title: "SpectrumCanvas",
    copy: "Draws frequency-domain analyser bars for compact spectrum displays.",
  },
];

export default function DocsPage() {
  return (
    <PageShell active="docs">
      <main className="docPage">
        <section className="docHero">
          <div className="wrap">
            <span className="kicker">Documentation</span>
            <h1>Install, wrap, play, stop.</h1>
            <p>
              The public API stays focused: safe tone playback, frequency
              sweeps, short noise bursts, pitch helpers, volume control, and
              analyser output for React applications.
            </p>
            <div className="heroActions">
              <Link className="button buttonPrimary" href="/docs/recipes">
                Recipes
              </Link>
              <Link className="button" href="/docs/examples">
                Example apps
              </Link>
              <Link className="button" href="/docs/frameworks">
                Framework comparison
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap docLayout">
            <aside className="toc" aria-label="Documentation sections">
              <a href="#install">Install</a>
              <a href="#copy-paste">Copy-paste</a>
              <a href="#provider">Provider</a>
              <a href="#tone">Tone hook</a>
              <a href="#envelopes">Envelopes</a>
              <a href="#sound-shaping">Sound shaping</a>
              <a href="#patterns">Repeat patterns</a>
              <a href="#sweep">Sweep hook</a>
              <a href="#noise">Noise hook</a>
              <a href="#test-mode">Test mode</a>
              <a href="#helpers">API helpers</a>
              <a href="#frameworks">Frameworks</a>
              <a href="#benchmarks">Benchmarks</a>
              <a href="#api-reference">Reference</a>
              <a href="#agent-brief">Agent brief</a>
              <a href="#browser">Browser behavior</a>
              <a href="#release-history">Releases</a>
            </aside>

            <article className="docContent">
              <SectionHeader
                kicker="Start"
                title="Install the packages."
                copy="Install both packages in app projects so React hooks and core helpers resolve explicitly."
              />
              <span id="install" className="anchorTarget" />
              <CodeBlock title="package install">{`pnpm add @webaudio-kit/react @webaudio-kit/core`}</CodeBlock>

              <h2 id="copy-paste">Copy-paste React starter</h2>
              <p>
                Paste this into <code>App.tsx</code> in a React app after
                installing the packages. The button click is the user gesture
                that lets the provider create and resume browser audio.
              </p>
              <CodeBlock title="Paste this into App.tsx">{`import { AudioProvider, useTone } from "@webaudio-kit/react";

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
}`}</CodeBlock>
              <div className="docActionLinks">
                <Link className="button buttonPrimary" href="/demos/tone">
                  Open quickstart demo
                </Link>
                <Link className="button" href="/demos">
                  Browse all demos
                </Link>
              </div>

              <h2 id="provider">Provider</h2>
              <p>
                Put <code>AudioProvider</code> around the part of the app that
                owns playback controls. The provider creates the audio context
                only after a hook needs playback, resumes it from user-initiated
                handlers, and keeps default master gain at <code>0.2</code>.
              </p>
              <CodeBlock title="provider setup">{`import { AudioProvider } from "@webaudio-kit/react";

export function Root() {
  return (
    <AudioProvider>
      <AppControls />
    </AudioProvider>
  );
}`}</CodeBlock>

              <h2 id="tone">Tone hook</h2>
              <p>
                <code>useTone</code> returns stable <code>play</code>,{" "}
                <code>stop</code>, and <code>isPlaying</code> controls. A play
                call creates a fresh oscillator, gain node, and pan node, then
                cleans them up when stopped.
              </p>
              <CodeBlock title="tone control">{`const tone = useTone({
  frequency: 440,
  gain: 0.15,
  type: "sine",
  pan: 0,
});

await tone.play({ durationMs: 500 });
tone.stop();`}</CodeBlock>
              <div className="docActionLinks">
                <Link className="button" href="/demos/tone">
                  Open tone demo
                </Link>
              </div>

              <h2 id="envelopes">Envelopes</h2>
              <p>
                Use <code>envelope</code> on tones, sweeps, and noise bursts to
                fade generated audio in and out. Attack, decay, and release are
                milliseconds; sustain is a <code>0..1</code> gain multiplier.
              </p>
              <CodeBlock title="soft cue envelope">{`const sweep = useFrequencySweep({
  from: 440,
  to: 880,
  durationMs: 500,
  gain: 0.12,
  envelope: { attackMs: 10, decayMs: 40, sustain: 0.7, releaseMs: 80 },
});`}</CodeBlock>

              <h2 id="sound-shaping">Sound shaping</h2>
              <p>
                Use <code>filter</code>, <code>detuneCents</code>, and{" "}
                <code>voices</code> to make alert cues less thin or harsh
                without shipping audio files.
              </p>
              <CodeBlock title="warning cue styling">{`await tone.play({
  frequency: 660,
  durationMs: 220,
  gain: 0.15,
  type: "sawtooth",
  envelope: { attackMs: 8, releaseMs: 55 },
  filter: { frequency: 1800, q: 0.7 },
  voices: { count: 2, spreadCents: 10 },
});`}</CodeBlock>

              <h2 id="patterns">Repeat patterns</h2>
              <p>
                Tones, sweeps, and noise bursts accept{" "}
                <code>pattern: {"{ repeat, gapMs }"}</code> for alert cues. The
                returned handle stops the whole scheduled pattern, including
                future voices.
              </p>
              <CodeBlock title="alert cue pattern">{`const alertTone = useTone();

await alertTone.play({
  frequency: 880,
  durationMs: 120,
  gain: 0.12,
  type: "square",
  envelope: { attackMs: 8, releaseMs: 45 },
  pattern: { repeat: 3, gapMs: 90 },
});

alertTone.stop();`}</CodeBlock>

              <h2 id="sweep">Sweep hook</h2>
              <p>
                <code>useFrequencySweep</code> clamps both frequency endpoints
                and schedules a linear ramp from <code>from</code> to{" "}
                <code>to</code>. Keep sweep controls conservative in demos.
              </p>
              <CodeBlock title="sweep control">{`const sweep = useFrequencySweep({
  from: 250,
  to: 8000,
  durationMs: 2400,
  gain: 0.12,
});

await sweep.play();
sweep.stop();`}</CodeBlock>
              <div className="docActionLinks">
                <Link className="button" href="/demos/sweep">
                  Open sweep demo
                </Link>
              </div>

              <h2 id="noise">Noise hook</h2>
              <p>
                <code>useNoise</code> creates short white, pink, or brown noise
                buffers per play call. Keep burst duration short and default
                gain conservative.
              </p>
              <CodeBlock title="noise control">{`const noise = useNoise({
  type: "pink",
  durationMs: 800,
  gain: 0.08,
});

await noise.play();
noise.stop();`}</CodeBlock>
              <div className="docActionLinks">
                <Link className="button" href="/demos/noise">
                  Open noise demo
                </Link>
              </div>

              <h2 id="test-mode">Audio test mode</h2>
              <p>
                <code>useAudioTestMode</code> runs a short low-gain diagnostic
                sequence for tone output, stereo pan, sweep scheduling, noise
                buffers, and analyser routing.
              </p>
              <CodeBlock title="test mode">{`const testMode = useAudioTestMode();

await testMode.run();
testMode.stop();`}</CodeBlock>
              <div className="docActionLinks">
                <Link className="button" href="/demos/test-mode">
                  Open test mode demo
                </Link>
              </div>

              <h2 id="helpers">React surfaces and helpers</h2>
              <div className="apiGrid">
                {apiCards.map((card) => (
                  <article className="infoCard" key={card.title}>
                    <IconBadge name={card.icon} />
                    <h3>{card.title}</h3>
                    <p>{card.copy}</p>
                  </article>
                ))}
              </div>
              <CodeBlock title="math helpers">{`import {
  clampFrequency,
  dbToGain,
  frequencyToNoteName,
  gainToDb,
} from "@webaudio-kit/core";

const frequency = clampFrequency(inputFrequency); // 20..20000 by default
const gain = dbToGain(-14);
const db = gainToDb(0.2);
const note = frequencyToNoteName(440); // A4`}</CodeBlock>
              <div className="docActionLinks">
                <Link className="button" href="/demos/volume">
                  Open volume demo
                </Link>
                <Link className="button" href="/demos/visualizer">
                  Open visualizer demo
                </Link>
                <Link className="button" href="/demos/pitch">
                  Open pitch helper demo
                </Link>
              </div>

              <h2 id="frameworks">Framework setup</h2>
              <p>
                Provider placement changes slightly between Vite React, Next App
                Router, and plain React. The dedicated comparison page shows
                where the provider belongs, where Next client boundaries are
                required, and how browser autoplay rules affect each setup.
              </p>
              <div className="docActionLinks">
                <Link className="button buttonPrimary" href="/docs/frameworks">
                  Framework comparison
                </Link>
                <Link className="button" href="/docs/examples">
                  Example apps
                </Link>
              </div>

              <h2 id="benchmarks">Benchmarks</h2>
              <p>
                Local benchmarks cover math helpers, playback scheduling,
                analyser frame work, and React hook overhead. They are
                telemetry-free trend checks, not cross-device score claims.
              </p>
              <div className="docActionLinks">
                <Link className="button buttonPrimary" href="/docs/benchmarks">
                  Benchmarks
                </Link>
                <a
                  className="button"
                  href="https://github.com/i-afaqrashid/webaudio-kit/blob/main/docs/benchmarks.md"
                  rel="noreferrer"
                  target="_blank"
                >
                  Markdown benchmark guide
                </a>
              </div>

              <h2 id="api-reference">API reference</h2>
              <p>
                Use the dedicated API page when you need signatures, option
                tables, return values, and copy-paste examples for every public
                React and core export.
              </p>
              <div className="docActionLinks">
                <Link className="button buttonPrimary" href="/docs/api">
                  API reference
                </Link>
              </div>

              <h2 id="agent-brief">AI agent brief CLI</h2>
              <p>
                <code>@webaudio-kit/cli</code> can generate an{" "}
                <code>AGENTS.md</code> style file for Codex, Claude Code, Gemini
                CLI, OpenCode, Antigravity, and similar tools. The file points
                agents to the public docs, npm pages, examples, browser autoplay
                rules, safe gain defaults, and non-medical scope boundary before
                they edit app code.
              </p>
              <CodeBlock title="agent brief">{`pnpm dlx @webaudio-kit/cli agent-brief
pnpm dlx @webaudio-kit/cli agent-brief --target codex --out AGENTS.md`}</CodeBlock>

              <h2 id="browser">Browser behavior</h2>
              <div className="noteStack">
                <div className="noteCard">
                  <strong>Autoplay behavior</strong>
                  <p>
                    Browsers may block audio until the user clicks, taps, or
                    presses a key. Call <code>play</code> from a user action and
                    let the provider resume the context there.
                  </p>
                  <Link href="/docs/api#audio-provider-state-machine">
                    AudioProvider state machine
                  </Link>
                </div>
                <div className="noteCard">
                  <strong>Safety boundary</strong>
                  <p>
                    Keep default volume low, clamp frequencies, and avoid
                    medical or audiology claims unless a separate certified
                    system validates the whole product.
                  </p>
                </div>
              </div>

              <h2 id="release-history">Release history</h2>
              <p>
                The website, npm package pages, and GitHub Releases all point
                back to the same versioned changelog. Use it when you need to
                verify published exports, package tarballs, or release notes for
                a specific version.
              </p>
              <div className="docActionLinks">
                <Link className="button buttonPrimary" href="/changelog">
                  Release history
                </Link>
                <a
                  className="button"
                  href="https://github.com/i-afaqrashid/webaudio-kit/releases"
                  rel="noreferrer"
                  target="_blank"
                >
                  GitHub Releases
                </a>
              </div>

              <h2 id="more">More docs</h2>
              <p>
                The repository also keeps source Markdown docs for API details,
                safety, browser behavior, deployment, testing, and performance.
              </p>
              <ul className="docLinks">
                <li>
                  <Link href="/docs/api">Full API reference</Link>
                </li>
                <li>
                  <Link href="/demos">Interactive demo pages</Link>
                </li>
                <li>
                  <Link href="/changelog">Versioned release history</Link>
                </li>
                <li>
                  <Link href="/docs/benchmarks">Telemetry-free benchmarks</Link>
                </li>
                <li>
                  <a
                    href="https://github.com/i-afaqrashid/webaudio-kit/tree/main/docs"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Markdown docs directory
                  </a>
                </li>
              </ul>
            </article>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
