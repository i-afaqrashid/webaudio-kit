import { DemoDetail, getDemoMetadata } from "../demo-pages";

export const metadata = getDemoMetadata("volume");

export default function VolumeDemoPage() {
  return <DemoDetail slug="volume" />;
}
