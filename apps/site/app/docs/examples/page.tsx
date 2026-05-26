import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock, PageShell, SectionHeader } from "../../components";

export const metadata: Metadata = {
  title: "Examples",
  description:
    "Standalone webaudio-kit example apps for Vite React, Next App Router, plain React, and audio test mode.",
};

const examples = [
  {
    path: "examples/vite-react",
    title: "Vite React",
    copy: "Main tone, sweep, noise, volume, waveform, and spectrum example for client-side React apps.",
    command: `cd examples/vite-react
pnpm install
pnpm dev`,
  },
  {
    path: "examples/next-app-router",
    title: "Next App Router",
    copy: "Server page with a client component boundary for AudioProvider, hooks, and visualizer canvases.",
    command: `cd examples/next-app-router
pnpm install
pnpm dev`,
  },
  {
    path: "examples/plain-react",
    title: "Plain React",
    copy: "Smallest provider, tone, volume, waveform, and spectrum setup.",
    command: `cd examples/plain-react
pnpm install
pnpm dev`,
  },
  {
    path: "examples/audio-test-mode",
    title: "Audio test mode",
    copy: "Low-gain diagnostic sequence with analyser output and manual stop controls.",
    command: `cd examples/audio-test-mode
pnpm install
pnpm dev`,
  },
];

export default function ExampleDocsPage() {
  return (
    <PageShell active="docs">
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
