import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock, PageShell, SectionHeader } from "../../components";
import { createPageMetadata } from "../../metadata";

const description =
  "Choose between webaudio-kit React hooks and core Web Audio primitives, then combine them safely with AudioProvider.";

export const metadata: Metadata = createPageMetadata({
  title: "Hooks vs Core",
  description,
  path: "/docs/hooks-vs-core",
});

export default function HooksVsCoreDocsPage() {
  return (
    <PageShell active="docs">
      <main className="docPage">
        <section className="docHero">
          <div className="wrap">
            <span className="kicker">Interop guide</span>
            <h1>Hooks vs Core.</h1>
            <p>
              Use React hooks for normal app controls, core primitives for
              custom Web Audio graphs, and <code>ensureAudioContext()</code>{" "}
              when a React screen needs both.
            </p>
            <div className="heroActions">
              <Link className="button buttonPrimary" href="/docs/api">
                API reference
              </Link>
              <Link className="button" href="/docs/examples">
                Examples
              </Link>
              <Link className="button" href="/docs/recipes">
                Recipes
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap docLayout">
            <aside className="toc" aria-label="Hooks vs Core sections">
              <a href="#hooks-first">Hooks first</a>
              <a href="#core-first">Core first</a>
              <a href="#interop">React + core interop</a>
              <a href="#checklist">Decision checklist</a>
            </aside>

            <article className="docContent">
              <SectionHeader
                kicker="Choice"
                title="Start with hooks, drop to core when the graph is yours."
                copy="The React layer owns provider ergonomics. The core layer owns reusable playback primitives."
              />

              <h2 id="hooks-first">Hooks first for React apps</h2>
              <p>
                Use hooks when playback belongs to React UI state.{" "}
                <code>AudioProvider</code> creates the context lazily, connects{" "}
                <code>masterGain -&gt; analyser -&gt; destination</code>, and
                lets hooks expose stable <code>play</code>, <code>stop</code>,
                and <code>isPlaying</code> controls.
              </p>
              <CodeBlock title="hook playback">{`import { AudioProvider, useTone } from "@webaudio-kit/react";

function CueButton() {
  const cue = useTone({
    durationMs: 180,
    frequency: 880,
    gain: 0.12,
    type: "square",
  });

  return (
    <button onClick={() => void cue.play()}>
      {cue.isPlaying ? "Restart cue" : "Play cue"}
    </button>
  );
}

export function App() {
  return (
    <AudioProvider>
      <CueButton />
    </AudioProvider>
  );
}`}</CodeBlock>

              <h2 id="core-first">
                Core first for non-React and custom graphs
              </h2>
              <p>
                Use <code>@webaudio-kit/core</code> directly when React is not
                involved or when your application owns the destination node,
                scheduling, and handle lifecycle.
              </p>
              <CodeBlock title="custom graph">{`import { playFrequencySweep, playTone } from "@webaudio-kit/core";

const audioContext = new AudioContext();
const masterGain = audioContext.createGain();
const analyser = audioContext.createAnalyser();

masterGain.gain.value = 0.2;
masterGain.connect(analyser);
analyser.connect(audioContext.destination);

await audioContext.resume();

const tone = playTone(
  audioContext,
  { durationMs: 240, frequency: 660, gain: 0.12 },
  masterGain,
);

const sweep = playFrequencySweep(
  audioContext,
  { durationMs: 700, from: 400, gain: 0.08, to: 1600 },
  masterGain,
);

tone.stop();
sweep.stop();`}</CodeBlock>

              <h2 id="interop">React + core interop</h2>
              <p>
                In React, call <code>ensureAudioContext()</code> from the user
                action instead of direct <code>audio.audioContext</code> null
                checks. It returns the same provider runtime that hooks use.
              </p>
              <CodeBlock title="provider-routed core playback">{`import { playNoise, playTone } from "@webaudio-kit/core";
import { useAudioContext } from "@webaudio-kit/react";

function LayeredCueButton() {
  const audio = useAudioContext();

  async function playLayeredCue() {
    const runtime = await audio.ensureAudioContext();
    const tone = playTone(
      runtime.audioContext,
      {
        durationMs: 180,
        envelope: { attackMs: 8, releaseMs: 45 },
        frequency: 880,
        gain: 0.1,
        pattern: { repeat: 2, gapMs: 80 },
        type: "square",
      },
      runtime.masterGain,
    );
    const noise = playNoise(
      runtime.audioContext,
      {
        durationMs: 120,
        envelope: { attackMs: 4, releaseMs: 50 },
        gain: 0.025,
        type: "pink",
      },
      runtime.masterGain,
    );

    setTimeout(() => {
      tone.stop();
      noise.stop();
    }, 700);
  }

  return (
    <>
      <button onClick={() => void playLayeredCue()}>Play layered cue</button>
      <button onClick={() => audio.stopAll()}>Stop hook playback</button>
    </>
  );
}`}</CodeBlock>
              <p>
                Passing <code>runtime.masterGain</code> routes core playback
                through the provider analyser, so <code>WaveformCanvas</code>,{" "}
                <code>SpectrumCanvas</code>, and master volume still react to
                the custom cue.
              </p>
              <p>
                The direct call shape is{" "}
                <code>
                  playTone(runtime.audioContext, options, runtime.masterGain)
                </code>{" "}
                or{" "}
                <code>
                  playNoise(runtime.audioContext, options, runtime.masterGain)
                </code>
                .
              </p>

              <h2 id="checklist">Decision checklist</h2>
              <div className="noteStack">
                <div className="noteCard">
                  <strong>Use hooks when</strong>
                  <p>
                    The playback belongs to React UI state and you want stable
                    controls, hook cleanup, and provider <code>stopAll()</code>.
                  </p>
                </div>
                <div className="noteCard">
                  <strong>Use core when</strong>
                  <p>
                    The app is not React, or you own a custom Web Audio graph
                    and will track every returned handle yourself.
                  </p>
                </div>
                <div className="noteCard">
                  <strong>Use both when</strong>
                  <p>
                    A React screen mostly uses hooks, but one advanced action
                    needs direct <code>playTone</code>,{" "}
                    <code>playFrequencySweep</code>, or <code>playNoise</code>.
                  </p>
                </div>
              </div>

              <div className="docActionLinks">
                <Link
                  className="button buttonPrimary"
                  href="/docs/api#use-audio-context"
                >
                  useAudioContext API
                </Link>
                <Link className="button" href="/docs/examples">
                  Example apps
                </Link>
                <a
                  className="button"
                  href="https://github.com/i-afaqrashid/webaudio-kit/blob/main/docs/hooks-vs-core.md"
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
