import { cleanup, render, screen } from "@testing-library/react";
import {
  createElement,
  type AnchorHTMLAttributes,
  type ReactNode,
} from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import DocsPage from "./docs/page";
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
    render(createElement(HomePage));

    expect(
      screen.getByRole("heading", {
        name: "Browser tones and sweeps without fighting AudioContext.",
      }),
    ).toBeTruthy();
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

    const docsDirectoryLink = screen.getByRole("link", {
      name: "Markdown docs directory",
    });
    expect(docsDirectoryLink.getAttribute("target")).toBe("_blank");
    expect(docsDirectoryLink.getAttribute("rel")).toBe("noreferrer");
  });
});
