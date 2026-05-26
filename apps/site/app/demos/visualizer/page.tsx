import { DemoDetail, getDemoMetadata } from "../demo-pages";

export const metadata = getDemoMetadata("visualizer");

export default function VisualizerDemoPage() {
  return <DemoDetail slug="visualizer" />;
}
