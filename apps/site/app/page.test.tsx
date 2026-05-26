import { existsSync, readFileSync } from "node:fs";
import { cleanup, render, screen } from "@testing-library/react";
import {
  createElement,
  type AnchorHTMLAttributes,
  type ReactNode,
} from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import ChangelogPage from "./changelog/page";
import { DemoDetail, DemoIndex } from "./demos/demo-pages";
import ApiDocsPage from "./docs/api/page";
import ExampleDocsPage from "./docs/examples/page";
import DocsPage from "./docs/page";
import RecipeDocsPage from "./docs/recipes/page";
import HomePage from "./page";

type MockLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  children: ReactNode;
  href: string | { pathname?: string };
};

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: MockLinkProps) =>
    createElement(
      "a",
      {
        href: typeof href === "string" ? href : (href.pathname ?? ""),
        ...props,
      },
      children,
    ),
}));

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    () =>
      ({
        beginPath: vi.fn(),
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        lineTo: vi.fn(),
        moveTo: vi.fn(),
        stroke: vi.fn(),
        fillStyle: "",
        lineWidth: 1,
        strokeStyle: "",
      }) as unknown as CanvasRenderingContext2D,
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("site pages", () => {
  test("home page renders the package pitch, live demo, and external GitHub link", () => {
    const { container } = render(createElement(HomePage));

    expect(
      screen.getByRole("heading", {
        name: "Browser tones and sweeps without fighting AudioContext.",
      }),
    ).toBeTruthy();
    expect(container.querySelector(".hero > .wrap.heroCopy")).toBeNull();
    expect(container.querySelector(".hero > .wrap > .heroCopy")).toBeTruthy();
    expect(container.querySelector(".hero .demoShell")).toBeNull();
    expect(container.querySelector(".hero .heroActions")).toBeNull();
    expect(container.querySelector(".hero .installPill")).toBeNull();
    expect(container.querySelector(".demoSection .demoShell")).toBeTruthy();
    expect(screen.getByText("@webaudio-kit/core")).toBeTruthy();
    expect(screen.getByText("@webaudio-kit/react")).toBeTruthy();
    expect(screen.getByText("@webaudio-kit/cli")).toBeTruthy();
    expect(screen.getByText("Test mode")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Run test" })).toBeTruthy();
    expect(
      screen.getByRole("region", { name: "Primary audio controls" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("region", { name: "Live analyser panel" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("region", { name: "Additional audio checks" }),
    ).toBeTruthy();
    expect(screen.getByLabelText("Waveform analyser")).toBeTruthy();
    expect(screen.getByLabelText("Spectrum analyser")).toBeTruthy();

    const githubLinks = screen.getAllByRole("link", { name: /GitHub/ });
    expect(githubLinks[0]?.getAttribute("href")).toBe(
      "https://github.com/i-afaqrashid/webaudio-kit",
    );
    expect(githubLinks[0]?.getAttribute("target")).toBe("_blank");
    expect(githubLinks[0]?.getAttribute("rel")).toBe("noreferrer");

    const changelogLinks = screen.getAllByRole("link", {
      name: "Changelog",
    });
    expect(changelogLinks[0]?.getAttribute("href")).toBe("/changelog");
  });

  test("docs page includes test mode, agent brief, and browser safety sections", () => {
    render(createElement(DocsPage));

    expect(
      screen.getByRole("heading", { name: "Install, wrap, play, stop." }),
    ).toBeTruthy();
    expect(screen.getByRole("link", { name: "Test mode" })).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Audio test mode" }),
    ).toBeTruthy();
    expect(screen.getAllByText("useAudioTestMode")).toHaveLength(2);
    expect(screen.getByText("AI agent brief CLI")).toBeTruthy();
    expect(screen.getByText("Autoplay behavior")).toBeTruthy();
    expect(screen.getByText("Safety boundary")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Release history" }),
    ).toHaveProperty("href", "http://localhost:3000/changelog");
    expect(screen.getByRole("link", { name: "API reference" })).toHaveProperty(
      "href",
      "http://localhost:3000/docs/api",
    );
    expect(screen.getByRole("link", { name: "Recipes" })).toHaveProperty(
      "href",
      "http://localhost:3000/docs/recipes",
    );
    expect(screen.getByRole("link", { name: "Example apps" })).toHaveProperty(
      "href",
      "http://localhost:3000/docs/examples",
    );

    const docsDirectoryLink = screen.getByRole("link", {
      name: "Markdown docs directory",
    });
    expect(docsDirectoryLink.getAttribute("target")).toBe("_blank");
    expect(docsDirectoryLink.getAttribute("rel")).toBe("noreferrer");
  });

  test("docs page links every major audio surface to a dedicated demo", () => {
    render(createElement(DocsPage));

    expect(screen.getByText("Paste this into App.tsx")).toBeTruthy();
    expect(
      screen.getAllByRole("link", { name: "Open tone demo" })[0],
    ).toHaveProperty("href", "http://localhost:3000/demos/tone");
    expect(
      screen.getByRole("link", { name: "Open sweep demo" }),
    ).toHaveProperty("href", "http://localhost:3000/demos/sweep");
    expect(
      screen.getByRole("link", { name: "Open noise demo" }),
    ).toHaveProperty("href", "http://localhost:3000/demos/noise");
    expect(
      screen.getByRole("link", { name: "Open test mode demo" }),
    ).toHaveProperty("href", "http://localhost:3000/demos/test-mode");
  });

  test("site exposes a public API reference route for React and core exports", () => {
    expect(existsSync("apps/site/app/docs/api/page.tsx")).toBe(true);

    render(createElement(ApiDocsPage));

    expect(
      screen.getByRole("heading", { name: "Public API reference." }),
    ).toBeTruthy();
    for (const heading of [
      "AudioProvider",
      "useAudioContext",
      "useTone",
      "useFrequencySweep",
      "useNoise",
      "useVolume",
      "useAnalyser",
      "WaveformCanvas",
      "SpectrumCanvas",
      "useAudioTestMode",
      "Core helpers",
    ]) {
      expect(screen.getByRole("heading", { name: heading })).toBeTruthy();
    }

    expect(screen.getByText("ToneOptions.frequency")).toBeTruthy();
    expect(screen.getByText("FrequencySweepOptions.durationMs")).toBeTruthy();
    expect(screen.getByText("NoiseOptions.type")).toBeTruthy();
    expect(screen.getByText("AudioProviderProps.initialGain")).toBeTruthy();
    expect(screen.getByText("WaveformCanvasProps.strokeColor")).toBeTruthy();
    expect(screen.getByText("dbToGain(db)")).toBeTruthy();
    expect(
      screen.getByText("frequencyToNoteName(frequency, options)"),
    ).toBeTruthy();
    expect(
      screen.getAllByRole("link", { name: "Open tone demo" })[0],
    ).toHaveProperty("href", "http://localhost:3000/demos/tone");
    expect(screen.getByRole("link", { name: "Recipes" })).toHaveProperty(
      "href",
      "http://localhost:3000/docs/recipes",
    );
    expect(screen.getByRole("link", { name: "Examples" })).toHaveProperty(
      "href",
      "http://localhost:3000/docs/examples",
    );
  });

  test("site exposes public examples and recipes docs routes", () => {
    expect(existsSync("apps/site/app/docs/examples/page.tsx")).toBe(true);
    expect(existsSync("apps/site/app/docs/recipes/page.tsx")).toBe(true);

    render(createElement(ExampleDocsPage));

    expect(
      screen.getByRole("heading", { name: "Standalone example apps." }),
    ).toBeTruthy();
    expect(screen.getByText("examples/vite-react")).toBeTruthy();
    expect(screen.getByText("examples/next-app-router")).toBeTruthy();
    expect(screen.getByText("examples/plain-react")).toBeTruthy();
    expect(screen.getByText("pnpm examples:check")).toBeTruthy();

    cleanup();
    render(createElement(RecipeDocsPage));

    expect(
      screen.getByRole("heading", { name: "Copy-paste audio recipes." }),
    ).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Tone Button" })).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Safe Autoplay Pattern" }),
    ).toBeTruthy();
    expect(screen.getByText("browser autoplay behavior")).toBeTruthy();
  });

  test("site exposes dedicated demo routes", () => {
    for (const slug of ["tone", "sweep", "noise", "test-mode"]) {
      expect(existsSync(`apps/site/app/demos/${slug}/page.tsx`)).toBe(true);
    }
  });

  test("site exposes a public changelog route backed by the root changelog", async () => {
    expect(existsSync("apps/site/app/changelog/page.tsx")).toBe(true);

    render(createElement(ChangelogPage));

    expect(
      screen.getByRole("heading", { name: "Release history." }),
    ).toBeTruthy();
    expect(screen.getByRole("heading", { name: "1.5.2" })).toBeTruthy();
    expect(screen.getByText("npm Trusted Publishing")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "GitHub release v1.5.2" }),
    ).toHaveProperty(
      "href",
      "https://github.com/i-afaqrashid/webaudio-kit/releases/tag/v1.5.2",
    );
    expect(
      screen.getByRole("link", { name: "@webaudio-kit/react 1.5.2" }),
    ).toHaveProperty(
      "href",
      "https://www.npmjs.com/package/@webaudio-kit/react/v/1.5.2",
    );
  });

  test("demo index and focused demo pages render live workspaces", () => {
    render(createElement(DemoIndex));

    expect(
      screen.getByRole("heading", {
        name: "Focused browser audio workspaces.",
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Tone generator" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Frequency sweep" }),
    ).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Noise burst" })).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Audio test mode" }),
    ).toBeTruthy();

    cleanup();
    render(createElement(DemoDetail, { slug: "tone" }));

    expect(
      screen.getByRole("heading", { name: "Tone generator." }),
    ).toBeTruthy();
    expect(screen.getByText("tone.tsx")).toBeTruthy();
    expect(screen.getByRole("link", { name: "API reference" })).toHaveProperty(
      "href",
      "http://localhost:3000/docs/api",
    );
    expect(screen.getByRole("link", { name: "Recipes" })).toHaveProperty(
      "href",
      "http://localhost:3000/docs/recipes",
    );
    expect(screen.getByRole("link", { name: "Examples" })).toHaveProperty(
      "href",
      "http://localhost:3000/docs/examples",
    );
    expect(
      screen.getByRole("region", { name: "Live analyser panel" }),
    ).toBeTruthy();
  });

  test("docs page stylesheet offsets hash targets below the sticky header", () => {
    const css = readFileSync("apps/site/app/globals.css", "utf8");

    expect(css).toContain("--anchor-scroll-offset");
    expect(css).toMatch(
      /html\s*{[^}]*scroll-padding-top:\s*var\(--anchor-scroll-offset\);/s,
    );
    expect(css).toMatch(
      /\.docContent\s+:where\(h2\[id\],\s*h3\[id\]\),\s*\.anchorTarget\s*{[^}]*scroll-margin-top:\s*var\(--anchor-scroll-offset\);/s,
    );
    expect(css).toMatch(
      /\.releaseCard\[id\]\s*{[^}]*scroll-margin-top:\s*var\(--anchor-scroll-offset\);/s,
    );
  });
});
