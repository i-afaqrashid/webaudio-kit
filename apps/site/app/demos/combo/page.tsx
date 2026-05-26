import { DemoDetail, getDemoMetadata } from "../demo-pages";

export const metadata = getDemoMetadata("combo");

export default function ComboDemoPage() {
  return <DemoDetail slug="combo" />;
}
