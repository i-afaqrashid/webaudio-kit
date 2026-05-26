import { DemoDetail, getDemoMetadata } from "../demo-pages";

export const metadata = getDemoMetadata("pitch");

export default function PitchDemoPage() {
  return <DemoDetail slug="pitch" />;
}
