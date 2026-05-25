import { DemoDetail, getDemoMetadata } from "../demo-pages";

export const metadata = getDemoMetadata("tone");

export default function ToneDemoPage() {
  return <DemoDetail slug="tone" />;
}
