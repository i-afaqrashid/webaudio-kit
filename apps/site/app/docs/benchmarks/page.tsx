import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock, PageShell, SectionHeader } from "../../components";
import { createPageMetadata } from "../../metadata";

const description =
  "Run webaudio-kit local benchmarks without telemetry, analytics, tracking, or cross-device score claims.";

export const metadata: Metadata = createPageMetadata({
  title: "Benchmarks",
  description,
  path: "/docs/benchmarks",
});

const benchmarkFiles = [
  {
    path: "benchmarks/core-math.bench.ts",
    title: "Core math",
    copy: "dB/gain conversion, frequency clamping, and note-label formatting.",
  },
  {
    path: "benchmarks/core-playback.bench.ts",
    title: "Core playback",
    copy: "tone, sweep, noise, gain, pan, duration scheduling, and stop cleanup with fake Web Audio nodes.",
  },
  {
    path: "benchmarks/analyser-frame.bench.ts",
    title: "Analyser frames",
    copy: "analyser frame reads and waveform coordinate calculations.",
  },
  {
    path: "benchmarks/react-hooks.bench.tsx",
    title: "React hooks",
    copy: "AudioProvider and hook render/control overhead with a fake AudioContext.",
  },
];

export default function BenchmarkDocsPage() {
  return (
    <PageShell active="docs">
      <main className="docPage">
        <section className="docHero">
          <div className="wrap">
            <span className="kicker">Benchmarks</span>
            <h1>Telemetry-free benchmark guide.</h1>
            <p>
              Run local timing checks for core math, playback scheduling,
              analyser processing, and React hook overhead without adding
              tracking or analytics.
            </p>
            <div className="heroActions">
              <Link className="button buttonPrimary" href="/docs">
                Docs guide
              </Link>
              <Link className="button" href="/docs/api">
                API reference
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap docLayout">
            <aside className="toc" aria-label="Benchmark sections">
              <a href="#run">Run</a>
              <a href="#measures">What it measures</a>
              <a href="#read">Read local numbers</a>
              <a href="#limits">Limits</a>
              <a href="#telemetry">No telemetry</a>
            </aside>

            <article className="docContent">
              <SectionHeader
                kicker="Local only"
                title="Use benchmarks as trend checks."
                copy="Benchmark output is useful when comparing one local branch against another under the same machine, Node version, and system load."
              />

              <h2 id="run">Run</h2>
              <CodeBlock title="local benchmark command">{`pnpm bench`}</CodeBlock>

              <h2 id="measures">What the suite measures</h2>
              <div className="exampleDocList">
                {benchmarkFiles.map((file) => (
                  <article className="exampleDocItem" key={file.path}>
                    <div>
                      <span className="kicker">{file.path}</span>
                      <h3>{file.title}</h3>
                      <p>{file.copy}</p>
                    </div>
                  </article>
                ))}
              </div>

              <h2 id="read">How to read local numbers</h2>
              <p>
                Treat results as local trend signals, not release gates. Compare
                before and after numbers from the same machine, with the same
                Node and pnpm versions, and note whether the changed code
                touches math helpers, graph scheduling, analyser work, or React
                hooks.
              </p>

              <h2 id="limits">Limits</h2>
              <p>
                Timing varies across browser engines, devices, CPU power modes,
                thermal state, background apps, and CI runners. The suite uses
                fake Web Audio nodes for repeatable JavaScript checks; it does
                not measure real speakers, sound hardware latency, or calibrated
                equipment.
              </p>

              <h2 id="telemetry">No telemetry</h2>
              <p>
                <code>pnpm bench</code> does not add telemetry, analytics,
                tracking, network uploads, browser fingerprinting, or user
                measurement. Benchmark output stays local unless a developer
                explicitly shares it.
              </p>

              <div className="docActionLinks">
                <a
                  className="button buttonPrimary"
                  href="https://github.com/i-afaqrashid/webaudio-kit/blob/main/docs/performance.md"
                  rel="noreferrer"
                  target="_blank"
                >
                  Performance notes
                </a>
                <a
                  className="button"
                  href="https://github.com/i-afaqrashid/webaudio-kit/tree/main/benchmarks"
                  rel="noreferrer"
                  target="_blank"
                >
                  Benchmark source
                </a>
              </div>
            </article>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
