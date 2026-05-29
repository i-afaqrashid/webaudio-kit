import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, SectionHeader } from "../../components";
import { createPageMetadata } from "../../metadata";

const description =
  "How webaudio-kit compares to Tone.js, Howler.js, and use-sound, and when to reach for each.";

export const metadata: Metadata = createPageMetadata({
  title: "Comparison",
  description,
  path: "/docs/comparison",
});

export default function ComparisonDocsPage() {
  return (
    <PageShell active="docs">
      <main className="docPage">
        <section className="docHero">
          <div className="wrap">
            <span className="kicker">Comparison</span>
            <h1>Where webaudio-kit fits.</h1>
            <p>
              There are a few well-established ways to do audio on the web. They
              solve different problems, so the right choice depends on what you
              are building.
            </p>
            <div className="heroActions">
              <Link className="button buttonPrimary" href="/docs">
                Quick start
              </Link>
              <Link className="button" href="/docs/hooks-vs-core">
                Hooks vs Core
              </Link>
              <Link className="button" href="/docs/scope">
                Scope
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap docLayout">
            <aside className="toc" aria-label="Comparison sections">
              <a href="#short-version">The short version</a>
              <a href="#when">When to reach for each</a>
              <a href="#together">Using them together</a>
            </aside>

            <article className="docContent">
              <SectionHeader
                kicker="Choice"
                title="Generate sound, or play files, or build music."
                copy="webaudio-kit generates and visualizes audio with no assets. Howler and use-sound play recorded files. Tone.js is a full music framework."
              />

              <h2 id="short-version">The short version</h2>
              <ul>
                <li>
                  <strong>webaudio-kit</strong> — generate audio (tones, sweeps,
                  noise) and visualize it, with no audio files. React hooks plus
                  a framework-agnostic core.
                </li>
                <li>
                  <strong>Tone.js</strong> — a full framework for making music
                  in the browser: synths, effects, transport, and scheduling.
                </li>
                <li>
                  <strong>Howler.js</strong> — play back audio files and sprites
                  across browsers.
                </li>
                <li>
                  <strong>use-sound</strong> — a small React hook for playing
                  audio files, built on Howler.
                </li>
              </ul>

              <h2 id="when">When to reach for each</h2>
              <table>
                <thead>
                  <tr>
                    <th>You want to…</th>
                    <th>Best fit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      Play a generated beep, chime, or alert with no assets
                    </td>
                    <td>webaudio-kit</td>
                  </tr>
                  <tr>
                    <td>Sweep a frequency or emit shaped noise</td>
                    <td>webaudio-kit</td>
                  </tr>
                  <tr>
                    <td>Draw a waveform or spectrum of live audio</td>
                    <td>webaudio-kit</td>
                  </tr>
                  <tr>
                    <td>Play a recorded sound effect or music file</td>
                    <td>Howler.js / use-sound</td>
                  </tr>
                  <tr>
                    <td>Build an instrument, sequencer, or DAW-style app</td>
                    <td>Tone.js</td>
                  </tr>
                </tbody>
              </table>

              <h2 id="together">Using them together</h2>
              <p>
                These libraries are not mutually exclusive. A common setup is
                use-sound or Howler for recorded effects and webaudio-kit for
                generated cues and visualizations. Pick per sound, not per
                project.
              </p>

              <div className="docActionLinks">
                <Link className="button buttonPrimary" href="/docs/recipes">
                  Recipes
                </Link>
                <a
                  className="button"
                  href="https://github.com/i-afaqrashid/webaudio-kit/blob/main/docs/comparison.md"
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
