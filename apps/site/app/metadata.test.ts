import type { Metadata } from "next";
import { describe, expect, test } from "vitest";
import { metadata as changelogMetadata } from "./changelog/page";
import { getDemoMetadata, demos, type DemoSlug } from "./demos/demo-pages";
import { metadata as demosMetadata } from "./demos/page";
import { metadata as apiMetadata } from "./docs/api/page";
import { metadata as examplesMetadata } from "./docs/examples/page";
import { metadata as frameworksMetadata } from "./docs/frameworks/page";
import { metadata as docsMetadata } from "./docs/page";
import { metadata as recipesMetadata } from "./docs/recipes/page";
import { metadata as homeMetadata } from "./page";
import { SOCIAL_IMAGE, SITE_NAME, createPageMetadata } from "./metadata";

type ExpectedPageMetadata = {
  description: string;
  path: string;
  title: string;
};

const pageMetadata: [Metadata, ExpectedPageMetadata][] = [
  [
    homeMetadata,
    {
      title: "webaudio-kit",
      description:
        "React hooks and browser-safe Web Audio primitives for tone tools, frequency sweeps, noise bursts, volume control, and analyser-driven UI.",
      path: "/",
    },
  ],
  [
    docsMetadata,
    {
      title: "Docs",
      description:
        "Install webaudio-kit, wire AudioProvider, use tone, sweep, and noise hooks, and understand browser audio safety constraints.",
      path: "/docs",
    },
  ],
  [
    apiMetadata,
    {
      title: "API Reference",
      description:
        "Public API reference for webaudio-kit React hooks, visualizer components, audio test mode, and core Web Audio helpers.",
      path: "/docs/api",
    },
  ],
  [
    examplesMetadata,
    {
      title: "Examples",
      description:
        "Standalone webaudio-kit example apps for Vite React, Next App Router, plain React, and audio test mode.",
      path: "/docs/examples",
    },
  ],
  [
    frameworksMetadata,
    {
      title: "Framework Setup Comparison",
      description:
        "Compare webaudio-kit setup patterns for Vite React, Next App Router, and plain React applications.",
      path: "/docs/frameworks",
    },
  ],
  [
    recipesMetadata,
    {
      title: "Recipes",
      description:
        "Copy-paste webaudio-kit recipes for tone buttons, sweeps, volume controls, visualizers, test mode, and browser autoplay.",
      path: "/docs/recipes",
    },
  ],
  [
    demosMetadata,
    {
      title: "Demos",
      description:
        "Focused webaudio-kit demos for tone generation, frequency sweeps, noise bursts, volume, pan, pitch helpers, and visualizer output.",
      path: "/demos",
    },
  ],
  [
    changelogMetadata,
    {
      title: "Changelog",
      description:
        "Versioned release history for webaudio-kit packages, GitHub Releases, and npm package pages.",
      path: "/changelog",
    },
  ],
];

describe("site metadata", () => {
  test("createPageMetadata emits factual Open Graph and Twitter metadata", () => {
    const metadata = createPageMetadata({
      description: "A concise browser audio page description.",
      path: "/docs/test",
      title: "Test Page",
    });

    expect(metadata.title).toBe("Test Page");
    expect(metadata.description).toBe(
      "A concise browser audio page description.",
    );
    expect(metadata.alternates).toEqual({ canonical: "/docs/test" });
    expect(metadata.openGraph).toMatchObject({
      description: "A concise browser audio page description.",
      images: [SOCIAL_IMAGE],
      siteName: SITE_NAME,
      title: "Test Page | webaudio-kit",
      type: "website",
      url: "/docs/test",
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      description: "A concise browser audio page description.",
      images: [SOCIAL_IMAGE.url],
      title: "Test Page | webaudio-kit",
    });
  });

  test("key routes expose route-specific title, description, OG, and Twitter data", () => {
    for (const [metadata, expected] of pageMetadata) {
      expect(metadata.title).toEqual(
        expected.title === SITE_NAME ? { absolute: SITE_NAME } : expected.title,
      );
      expect(metadata.description).toBe(expected.description);
      expect(metadata.alternates).toEqual({ canonical: expected.path });
      expect(metadata.openGraph).toMatchObject({
        description: expected.description,
        images: [SOCIAL_IMAGE],
        siteName: SITE_NAME,
        title:
          expected.title === SITE_NAME
            ? SITE_NAME
            : `${expected.title} | webaudio-kit`,
        type: "website",
        url: expected.path,
      });
      expect(metadata.twitter).toMatchObject({
        card: "summary_large_image",
        description: expected.description,
        images: [SOCIAL_IMAGE.url],
        title:
          expected.title === SITE_NAME
            ? SITE_NAME
            : `${expected.title} | webaudio-kit`,
      });
    }
  });

  test("focused demos use slug-specific metadata", () => {
    for (const demo of demos) {
      const metadata = getDemoMetadata(demo.slug as DemoSlug);

      expect(metadata.title).toBe(demo.title);
      expect(metadata.description).toBe(demo.copy);
      expect(metadata.alternates).toEqual({
        canonical: `/demos/${demo.slug}`,
      });
      expect(metadata.openGraph).toMatchObject({
        description: demo.copy,
        title: `${demo.title} | webaudio-kit`,
        url: `/demos/${demo.slug}`,
      });
      expect(metadata.twitter).toMatchObject({
        card: "summary_large_image",
        description: demo.copy,
        title: `${demo.title} | webaudio-kit`,
      });
    }
  });

  test("metadata descriptions avoid medical or hearing-test claims", () => {
    const allMetadata = [
      ...pageMetadata.map(([metadata]) => metadata),
      ...demos.map((demo) => getDemoMetadata(demo.slug as DemoSlug)),
    ];

    for (const metadata of allMetadata) {
      expect(metadata.description).not.toMatch(
        /audiology|diagnos|hearing test|medical/i,
      );
      expect(JSON.stringify(metadata.openGraph)).not.toMatch(
        /audiology|diagnos|hearing test|medical/i,
      );
      expect(JSON.stringify(metadata.twitter)).not.toMatch(
        /audiology|diagnos|hearing test|medical/i,
      );
    }
  });
});
