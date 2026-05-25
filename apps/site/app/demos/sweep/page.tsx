import { DemoDetail, getDemoMetadata } from "../demo-pages";

export const metadata = getDemoMetadata("sweep");

export default function SweepDemoPage() {
  return <DemoDetail slug="sweep" />;
}
