import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock, PageShell, SectionHeader } from "../../components";
import { createPageMetadata } from "../../metadata";

const description =
  "Understand where webaudio-kit fits: safe procedural UI audio, React hooks, core primitives, raw Web Audio, and full audio engines.";

export const metadata: Metadata = createPageMetadata({
  title: "Scope and Limitations",
  description,
  path: "/docs/scope",
});

export default function ScopeDocsPage() {
  return (
    <PageShell active="docs">
      <main className="docPage">
        <section className="docHero">
          <div className="wrap">
            <span className="kicker">Product scope</span>
            <h1>Scope and limitations.</h1>
            <p>
              webaudio-kit is for safe procedural UI audio in browser apps:
              short tones, sweeps, noise bursts, volume controls, analyser
              visuals, and React ergonomics around Web Audio.
            </p>
            <div className="heroActions">
              <Link className="button buttonPrimary" href="/docs/hooks-vs-core">
                Hooks vs Core
              </Link>
              <Link className="button" href="/docs/recipes">
                Recipes
              </Link>
              <Link className="button" href="/docs/api">
                API reference
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap docLayout">
            <aside className="toc" aria-label="Scope sections">
              <a href="#fit">What it is for</a>
              <a href="#not">What it is not</a>
              <a href="#hooks">Hooks</a>
              <a href="#core">Core</a>
              <a href="#raw-web-audio">Raw Web Audio</a>
              <a href="#full-engine">Full engines</a>
              <a href="#limits">Current limitations</a>
              <a href="#checklist">Checklist</a>
            </aside>

            <article className="docContent">
              <SectionHeader
                kicker="Boundary"
                title="Small generated sounds, not a full synth platform."
                copy="The package aims to make common product audio reliable while keeping deeper graph ownership available through Web Audio itself."
              />

              <h2 id="fit">What webaudio-kit is for</h2>
              <p>
                Use webaudio-kit when an app needs short browser-generated
                sounds and React-friendly controls: alert cues, confirmation
                sounds, test tones, analyser visuals, and conservative volume
                defaults.
              </p>
              <div className="noteStack">
                <div className="noteCard">
                  <strong>Product UI audio</strong>
                  <p>
                    Tone, sweep, and noise playback for dashboards, admin tools,
                    onboarding checks, alert consoles, and demo panels.
                  </p>
                </div>
                <div className="noteCard">
                  <strong>Provider ergonomics</strong>
                  <p>
                    Lazy <code>AudioContext</code> creation, shared master gain,
                    analyser routing, and <code>stopAll()</code> controls.
                  </p>
                </div>
                <div className="noteCard">
                  <strong>Visible signal</strong>
                  <p>
                    Waveform and spectrum canvases that show the provider graph
                    is active without each app rewriting analyser loops.
                  </p>
                </div>
              </div>

              <h2 id="not">What webaudio-kit is not</h2>
              <p>
                It is not a DAW, sampler, sequencer, medical system, Tone.js
                competitor, or full synthesizer graph. It is also not a custom
                DSP package for AudioWorklets.
              </p>
              <CodeBlock title="scope boundary">{`webaudio-kit:
  good fit: safe procedural UI audio
  good fit: React hooks + provider graph
  escape hatch: core primitives and raw Web Audio

not the target:
  full synthesizer graph
  transport / measures / loops
  AudioWorklets
  medical or calibrated hearing tests`}</CodeBlock>

              <h2 id="hooks">When hooks are enough</h2>
              <p>
                Start with <code>@webaudio-kit/react</code> hooks when playback
                belongs to React UI state and the sound fits tone, sweep, noise,
                volume, analyser, or test-mode behavior.
              </p>
              <ul className="docLinks">
                <li>
                  Use hooks for stable play, stop, and isPlaying controls.
                </li>
                <li>
                  Use hooks when visualizers should follow provider output.
                </li>
                <li>
                  Use hooks when provider stopAll should cancel active cues.
                </li>
                <li>
                  Use hooks when safe defaults matter more than graph freedom.
                </li>
              </ul>

              <h2 id="core">When core primitives are enough</h2>
              <p>
                Use <code>@webaudio-kit/core</code> when React is not involved
                or when a small custom graph already owns the{" "}
                <code>AudioContext</code> and destination node.
              </p>
              <CodeBlock title="core-owned graph">{`const context = new AudioContext();
const destination = context.createGain();
destination.connect(context.destination);

const handle = playTone(context, {
  durationMs: 240,
  frequency: 660,
  gain: 0.12,
}, destination);

handle.stop();`}</CodeBlock>

              <h2 id="raw-web-audio">When to use raw Web Audio</h2>
              <p>
                Use raw Web Audio directly when your product owns complex
                routing, buses, sends, sidechains, a routing matrix, long-lived
                node graphs, or scheduling rules that should outlive React
                components.
              </p>

              <h2 id="full-engine">
                When to use Tone.js or a full audio engine
              </h2>
              <p>
                Use Tone.js or another full audio engine when the product needs
                transport, tempo, synced loops, instruments, samplers, effects
                chains, modulation matrices, polyphonic note management, or
                musical scheduling.
              </p>

              <h2 id="limits">Current limitations</h2>
              <p>
                The main limits today are no full synthesizer graph, no
                AudioWorklets, no microphone pipeline, no advanced routing
                matrix, limited modulation, and a young ecosystem with fewer
                outside examples than older packages.
              </p>
              <p>
                The package does include envelopes, patterns, filters, and
                richer recipes, but those stay focused on short UI cues rather
                than becoming a general-purpose synth engine.
              </p>

              <h2 id="checklist">Decision checklist</h2>
              <div className="noteStack">
                <div className="noteCard">
                  <strong>Use hooks</strong>
                  <p>
                    Normal React product audio and provider-scoped playback.
                  </p>
                </div>
                <div className="noteCard">
                  <strong>Use core</strong>
                  <p>Non-React code or a custom destination node.</p>
                </div>
                <div className="noteCard">
                  <strong>Use another engine</strong>
                  <p>
                    Musical, instrument-grade, effect-heavy, or graph-heavy
                    apps.
                  </p>
                </div>
              </div>

              <div className="docActionLinks">
                <Link
                  className="button buttonPrimary"
                  href="/docs/hooks-vs-core"
                >
                  Hooks vs Core
                </Link>
                <Link className="button" href="/docs/recipes">
                  Recipes
                </Link>
                <a
                  className="button"
                  href="https://github.com/i-afaqrashid/webaudio-kit/blob/main/docs/scope-and-limitations.md"
                  rel="noreferrer"
                  target="_blank"
                >
                  Markdown guide
                </a>
              </div>
            </article>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
