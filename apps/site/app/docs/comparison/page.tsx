import type { Metadata } from "next";

import { PageShell } from "../../components";
import { DocSource } from "../../components";

export const metadata: Metadata = {
  title: "Comparison",
  description:
    "How webaudio-kit compares to Tone.js, Howler.js, and use-sound, and when to reach for each.",
  alternates: {
    canonical: "/docs/comparison",
  },
};

export default function ComparisonPage() {
  return (
    <PageShell>
      <h1>Comparison</h1>
      <p className="lede">
        There are a few well-established ways to do audio on the web. They solve
        different problems, so the right choice depends on what you are
        building.
      </p>

      <h2>The short version</h2>
      <ul>
        <li>
          <strong>webaudio-kit</strong> — generate audio (tones, sweeps, noise)
          and visualize it, with no audio files.
        </li>
        <li>
          <strong>Tone.js</strong> — a full framework for making music in the
          browser: synths, effects, transport, and scheduling.
        </li>
        <li>
          <strong>Howler.js</strong> — play back audio files and sprites across
          browsers.
        </li>
        <li>
          <strong>use-sound</strong> — a small React hook for playing audio
          files, built on Howler.
        </li>
      </ul>

      <h2>When to reach for each</h2>
      <table>
        <thead>
          <tr>
            <th>You want to…</th>
            <th>Best fit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Play a generated beep, chime, or alert with no assets</td>
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

      <p>
        webaudio-kit generates and analyzes audio rather than playing files, so
        there are no assets to ship. Tone.js is the richer choice for music and
        musical timing. Howler.js and use-sound are the choice when your sounds
        are recorded files. They are not mutually exclusive — pick per sound,
        not per project.
      </p>

      <DocSource path="docs/comparison.md" />
    </PageShell>
  );
}
