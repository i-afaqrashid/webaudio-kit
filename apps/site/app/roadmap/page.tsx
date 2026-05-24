import type { Metadata } from "next";
import { IconBadge, PageShell, SectionHeader } from "../components";

export const metadata: Metadata = {
  title: "Roadmap",
  description:
    "Production roadmap for webaudio-kit packages, demo apps, browser QA, and future Web Audio features.",
};

const lanes = [
  {
    title: "Release 1.0",
    status: "Packaging",
    icon: "package" as const,
    items: [
      "Publish @webaudio-kit/core and @webaudio-kit/react.",
      "Keep the API limited to tones, sweeps, volume, analyser, and math helpers.",
      "Verify npm provenance and package smoke checks before publish.",
    ],
  },
  {
    title: "Site and examples",
    status: "Public proof",
    icon: "book" as const,
    items: [
      "Deploy the public site to webaudio-kit.afaqrashid.com.",
      "Keep the Vite demo as the manual browser audio acceptance app.",
      "Add focused copy-paste examples for Vite, Next, and component libraries.",
    ],
  },
  {
    title: "Next package work",
    status: "After 1.0",
    icon: "rocket" as const,
    items: [
      "Extract a reusable waveform component once the analyser API is stable.",
      "Add spectrum visualizer helpers after browser QA covers more devices.",
      "Explore microphone support later with explicit permission and privacy docs.",
    ],
  },
];

export default function RoadmapPage() {
  return (
    <PageShell active="roadmap">
      <main>
        <section className="docHero">
          <div className="wrap">
            <span className="kicker">Roadmap</span>
            <h1>Small API first. More surfaces after proof.</h1>
            <p>
              The roadmap keeps webaudio-kit demo-first and production-safe:
              ship the narrow primitives, document browser behavior, then add
              visual components only when the base graph is proven.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <SectionHeader
              kicker="Plan"
              title="What ships now and what waits."
              copy="The line stays clear: browser audio toolkit, not audiology software."
            />
            <div className="roadmapGrid">
              {lanes.map((lane) => (
                <article className="roadmapCard" key={lane.title}>
                  <div className="roadmapTop">
                    <IconBadge name={lane.icon} />
                    <span>{lane.status}</span>
                  </div>
                  <h2>{lane.title}</h2>
                  <ul>
                    {lane.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section sectionMuted">
          <div className="wrap safetyBand">
            <IconBadge name="shield" />
            <div>
              <h2>Explicit non-goals</h2>
              <p>
                The first production release does not include microphone
                capture, AudioWorklets, calibration, medical claims, or
                hearing-test diagnosis. Those require separate design,
                permission handling, QA, and safety review.
              </p>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
