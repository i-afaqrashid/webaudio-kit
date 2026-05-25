import type { Metadata } from "next";
import { DemoIndex } from "./demo-pages";

export const metadata: Metadata = {
  title: "Demos",
  description:
    "Interactive webaudio-kit demos for tone generation, frequency sweeps, noise bursts, and audio test mode.",
};

export default function DemosPage() {
  return <DemoIndex />;
}
