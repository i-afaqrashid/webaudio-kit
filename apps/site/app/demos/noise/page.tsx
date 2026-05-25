import { DemoDetail, getDemoMetadata } from "../demo-pages";

export const metadata = getDemoMetadata("noise");

export default function NoiseDemoPage() {
  return <DemoDetail slug="noise" />;
}
