import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock, PageShell, SectionHeader } from "../../components";

export const metadata: Metadata = {
  title: "Framework Setup Comparison",
  description:
    "Compare webaudio-kit setup patterns for Vite React, Next App Router, and plain React applications.",
};

const frameworkRows = [
  {
    framework: "Vite React",
    examplePath: "examples/vite-react",
    provider:
      "Wrap the client root or the audio workspace inside AudioProvider in main.tsx.",
    autoplay:
      "Call play from click, tap, or key handlers in normal client components.",
  },
  {
    framework: "Next App Router",
    examplePath: "examples/next-app-router",
    provider:
      "Keep route files server-rendered when possible, then move AudioProvider and every hook into a client component.",
    autoplay:
      "The browser rule is the same, but the play handler must live inside a component marked with use client.",
  },
  {
    framework: "Plain React",
    examplePath: "examples/plain-react",
    provider:
      "Create the root with createRoot and wrap either the whole app or the smallest audio control island.",
    autoplay:
      "Use a real user gesture before creating or resuming AudioContext.",
  },
];

export default function FrameworkDocsPage() {
  return (
    <PageShell active="docs">
      <main className="docPage">
        <section className="docHero">
          <div className="wrap">
            <span className="kicker">Frameworks</span>
            <h1>Framework setup comparison.</h1>
            <p>
              Use the same public API across React setups, but place the
              provider where browser-only audio code is allowed to run.
            </p>
            <div className="heroActions">
              <Link className="button buttonPrimary" href="/docs/examples">
                Example apps
              </Link>
              <Link className="button" href="/docs/recipes">
                Recipes
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap docLayout">
            <aside className="toc" aria-label="Framework sections">
              <a href="#provider-placement">Provider placement</a>
              <a href="#next-boundary">Next client boundary</a>
              <a href="#autoplay">Browser autoplay</a>
              <a href="#build-checked">Build-checked examples</a>
            </aside>

            <article className="docContent">
              <SectionHeader
                kicker="Comparison"
                title="Same hooks, different boundaries."
                copy="webaudio-kit stays framework-light. The important choice is where to put AudioProvider so hooks run only in browser-capable React code."
              />

              <h2 id="provider-placement">Provider placement</h2>
              <p>
                Put <code>AudioProvider</code> around the controls, canvases,
                and hooks that need the shared master gain and analyser graph.
                Smaller provider islands are fine when only one screen owns
                audio playback.
              </p>

              <div className="exampleDocList">
                {frameworkRows.map((row) => (
                  <article className="exampleDocItem" key={row.framework}>
                    <div>
                      <span className="kicker">{row.examplePath}</span>
                      <h3>{row.framework}</h3>
                      <p>{row.provider}</p>
                      <p>{row.autoplay}</p>
                    </div>
                  </article>
                ))}
              </div>

              <CodeBlock title="Vite React root">{`import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AudioProvider } from "@webaudio-kit/react";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AudioProvider>
      <App />
    </AudioProvider>
  </StrictMode>,
);`}</CodeBlock>

              <h2 id="next-boundary">Next App Router client boundary</h2>
              <p>
                Next App Router pages and layouts are server components by
                default. Keep metadata, static copy, and layout code there, then
                move <code>AudioProvider</code>, audio hooks, and analyser
                canvases into a dedicated client component.
              </p>
              <CodeBlock title="app/audio-controls.tsx">{`"use client";

import { AudioProvider, useTone } from "@webaudio-kit/react";

function ToneButton() {
  const tone = useTone({ frequency: 440, gain: 0.14 });

  return (
    <button onClick={() => void tone.play({ durationMs: 600 })}>
      {tone.isPlaying ? "Restart tone" : "Play tone"}
    </button>
  );
}

export function AudioControls() {
  return (
    <AudioProvider>
      <ToneButton />
    </AudioProvider>
  );
}`}</CodeBlock>

              <h2 id="autoplay">Browser autoplay impact</h2>
              <p>
                Browser autoplay rules apply equally to Vite, Next, and plain
                React. Call <code>play()</code> from a user gesture such as a
                click, tap, or key press so the provider can lazily create and
                resume <code>AudioContext</code> at the right time.
              </p>
              <CodeBlock title="gesture handler">{`function PlayButton() {
  const tone = useTone({ frequency: 660, gain: 0.12 });

  return (
    <button onClick={() => void tone.play({ durationMs: 500 })}>
      Play
    </button>
  );
}`}</CodeBlock>

              <h2 id="build-checked">Build-checked examples</h2>
              <p>
                The standalone examples are intentionally outside the pnpm
                workspace. Release checks install packed tarballs so the example
                apps exercise the same package exports developers install from
                npm.
              </p>
              <CodeBlock title="example verification">{`pnpm examples:check`}</CodeBlock>

              <div className="docActionLinks">
                <Link className="button buttonPrimary" href="/docs/examples">
                  Example apps
                </Link>
                <Link className="button" href="/docs/api">
                  API reference
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
