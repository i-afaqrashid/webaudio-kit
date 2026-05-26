import type { Metadata } from "next";
import { createPageMetadata } from "../metadata";
import { DemoIndex } from "./demo-pages";

const description =
  "Focused webaudio-kit demos for tone generation, frequency sweeps, noise bursts, volume, pan, pitch helpers, and visualizer output.";

export const metadata: Metadata = createPageMetadata({
  title: "Demos",
  description,
  path: "/demos",
});

export default function DemosPage() {
  return <DemoIndex />;
}
