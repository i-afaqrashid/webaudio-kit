import { DemoDetail, getDemoMetadata } from "../demo-pages";

export const metadata = getDemoMetadata("pan");

export default function PanDemoPage() {
  return <DemoDetail slug="pan" />;
}
