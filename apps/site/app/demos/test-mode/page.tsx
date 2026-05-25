import { DemoDetail, getDemoMetadata } from "../demo-pages";

export const metadata = getDemoMetadata("test-mode");

export default function TestModeDemoPage() {
  return <DemoDetail slug="test-mode" />;
}
