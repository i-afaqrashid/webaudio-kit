import type { MetadataRoute } from "next";
import { SITE_URL } from "./metadata";

const STATIC_PATHS: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/docs", changeFrequency: "weekly", priority: 0.9 },
  { path: "/docs/api", changeFrequency: "weekly", priority: 0.8 },
  { path: "/docs/benchmarks", changeFrequency: "monthly", priority: 0.6 },
  { path: "/docs/examples", changeFrequency: "weekly", priority: 0.8 },
  { path: "/docs/frameworks", changeFrequency: "monthly", priority: 0.7 },
  { path: "/docs/hooks-vs-core", changeFrequency: "monthly", priority: 0.7 },
  { path: "/docs/recipes", changeFrequency: "weekly", priority: 0.7 },
  { path: "/docs/scope", changeFrequency: "monthly", priority: 0.6 },
  { path: "/demos", changeFrequency: "weekly", priority: 0.8 },
  { path: "/demos/combo", changeFrequency: "monthly", priority: 0.6 },
  { path: "/demos/noise", changeFrequency: "monthly", priority: 0.6 },
  { path: "/demos/pan", changeFrequency: "monthly", priority: 0.6 },
  { path: "/demos/pitch", changeFrequency: "monthly", priority: 0.6 },
  { path: "/demos/sweep", changeFrequency: "monthly", priority: 0.6 },
  { path: "/demos/test-mode", changeFrequency: "monthly", priority: 0.6 },
  { path: "/demos/tone", changeFrequency: "monthly", priority: 0.6 },
  { path: "/demos/visualizer", changeFrequency: "monthly", priority: 0.6 },
  { path: "/demos/volume", changeFrequency: "monthly", priority: 0.6 },
  { path: "/changelog", changeFrequency: "weekly", priority: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return STATIC_PATHS.map(({ path, changeFrequency, priority }) => ({
    url: new URL(path, SITE_URL).toString(),
    lastModified,
    changeFrequency,
    priority,
  }));
}
