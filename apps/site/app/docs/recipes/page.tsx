import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock, PageShell, SectionHeader } from "../../components";
import { RecipeLiveDemo, type RecipeDemoKind } from "./RecipeLiveDemo";

export const metadata: Metadata = {
  title: "Recipes",
  description:
    "Copy-paste webaudio-kit recipes for tone buttons, sweeps, volume controls, visualizers, test mode, and browser autoplay.",
};

type Recipe = {
  code: string;
  copy: string;
  demo: RecipeDemoKind;
  id: string;
  title: string;
};

const recipes: Recipe[] = [
  {
    id: "tone-button",
    title: "Tone Button",
    copy: "Use this when a UI needs one audible confirmation tone.",
    demo: "tone",
    code: `import { AudioProvider, useTone } from "@webaudio-kit/react";

function ToneButton() {
  const tone = useTone({ frequency: 440, gain: 0.14, type: "sine" });

  return (
    <button type="button" onClick={() => void tone.play({ durationMs: 600 })}>
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
    id: "frequency-sweep-control",
    title: "Frequency Sweep Control",
    copy: "Use a bounded sweep when you need to prove scheduling and frequency ramping.",
    demo: "sweep",
    code: `import { AudioProvider, useFrequencySweep } from "@webaudio-kit/react";

function SweepControl() {
  const sweep = useFrequencySweep({
    from: 250,
    to: 8000,
    durationMs: 2400,
    gain: 0.1,
  });

  return <button onClick={() => void sweep.play()}>Run sweep</button>;
}`,
  },
  {
    id: "master-volume-slider",
    title: "Master Volume Slider",
    copy: "Use provider volume for one shared master gain across tone, sweep, and noise controls.",
    demo: "volume",
    code: `import { useVolume } from "@webaudio-kit/react";

function MasterVolumeSlider() {
  const volume = useVolume();

  return (
    <input
      max={0.5}
      min={0}
      onChange={(event) => void volume.setGain(event.currentTarget.valueAsNumber)}
      step={0.01}
      type="range"
      value={volume.gain}
    />
  );
}`,
  },
  {
    id: "waveform-and-spectrum-panel",
    title: "Waveform And Spectrum Panel",
    copy: "Render both analyser views so developers can see that the provider graph is live.",
    demo: "visualizer",
    code: `import { SpectrumCanvas, WaveformCanvas } from "@webaudio-kit/react";

function SignalPanel() {
  return (
    <>
      <WaveformCanvas aria-label="Waveform analyser" />
      <SpectrumCanvas aria-label="Spectrum analyser" />
    </>
  );
}`,
  },
  {
    id: "audio-test-mode",
    title: "Audio Test Mode",
    copy: "Run short low-gain steps for tone output, pan, sweep scheduling, noise buffers, and analyser routing.",
    demo: "test-mode",
    code: `import { useAudioTestMode } from "@webaudio-kit/react";

function AudioSelfCheck() {
  const testMode = useAudioTestMode();

  return (
    <>
      <p>{testMode.currentStep?.label ?? "Idle"}</p>
      <button onClick={() => void testMode.run()}>Run test mode</button>
      <button onClick={testMode.stop}>Stop</button>
    </>
  );
}`,
  },
  {
    id: "safe-autoplay-pattern",
    title: "Safe Autoplay Pattern",
    copy: "Create and resume audio from a click, tap, or keyboard handler. Browser autoplay behavior is the main rule.",
    demo: "autoplay",
    code: `import { AudioProvider, useTone } from "@webaudio-kit/react";

function StartAudioButton() {
  const tone = useTone({ frequency: 660, gain: 0.08, durationMs: 300 });

  return (
    <button type="button" onClick={() => void tone.play()}>
      Start audio from user action
    </button>
  );
}`,
  },
];

export default function RecipeDocsPage() {
  return (
    <PageShell active="docs">
      <main className="docPage">
        <section className="docHero">
          <div className="wrap">
            <span className="kicker">Recipes</span>
            <h1>Copy-paste audio recipes.</h1>
            <p>
              Common webaudio-kit patterns for tones, sweeps, master volume,
              analyser UI, test mode, and browser autoplay behavior.
            </p>
            <span className="kicker">browser autoplay behavior</span>
            <div className="heroActions">
              <Link className="button buttonPrimary" href="/docs/examples">
                Examples
              </Link>
              <Link className="button" href="/docs/api">
                API reference
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap docLayout">
            <aside className="toc" aria-label="Recipe sections">
              {recipes.map((recipe) => (
                <a href={`#${recipe.id}`} key={recipe.id}>
                  {recipe.title}
                </a>
              ))}
            </aside>

            <article className="docContent">
              <SectionHeader
                kicker="Patterns"
                title="Start from the smallest useful snippet."
                copy="Keep playback inside user actions, keep gains conservative, and avoid medical claims."
              />

              {recipes.map((recipe) => (
                <section
                  className="apiReferenceSection"
                  id={recipe.id}
                  key={recipe.id}
                >
                  <div className="apiSectionHeader">
                    <h2>{recipe.title}</h2>
                    <p>{recipe.copy}</p>
                  </div>
                  <div className="recipePatternGrid">
                    <CodeBlock title={recipe.title}>{recipe.code}</CodeBlock>
                    <RecipeLiveDemo kind={recipe.demo} />
                  </div>
                </section>
              ))}

              <h2 id="scope">Scope boundary</h2>
              <p>
                Not medical software. These recipes are browser audio prototypes
                and are not diagnosis, screening, or calibrated audiology
                workflows.
              </p>
              <div className="docActionLinks">
                <Link className="button buttonPrimary" href="/docs/examples">
                  Examples
                </Link>
                <Link className="button" href="/docs">
                  Docs guide
                </Link>
              </div>
            </article>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
