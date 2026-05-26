#!/usr/bin/env node
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

export const SITE_QA_ROUTES = [
  {
    path: "/",
    heading: "Browser tones and sweeps without fighting AudioContext.",
    metadata: {
      title: "webaudio-kit",
      description:
        "React hooks and browser-safe Web Audio primitives for tone tools, frequency sweeps, noise bursts, volume control, and analyser-driven UI.",
      ogTitle: "webaudio-kit",
    },
    checks: [
      { role: "button", name: "Play tone" },
      { label: "Waveform analyser" },
      { text: "Latest release" },
    ],
  },
  {
    path: "/docs",
    heading: "Install, wrap, play, stop.",
    metadata: {
      title: "Docs | webaudio-kit",
      description:
        "Install webaudio-kit, wire AudioProvider, use tone, sweep, and noise hooks, and understand browser audio safety constraints.",
      ogTitle: "Docs | webaudio-kit",
    },
    checks: [
      { role: "link", name: "API reference" },
      { role: "link", name: "Release history" },
      { text: "Audio test mode" },
    ],
  },
  {
    path: "/docs/api",
    heading: "Public API reference.",
    metadata: {
      title: "API Reference | webaudio-kit",
      description:
        "Public API reference for webaudio-kit React hooks, visualizer components, audio test mode, and core Web Audio helpers.",
      ogTitle: "API Reference | webaudio-kit",
    },
    checks: [
      { text: "AudioProviderProps.initialGain" },
      { text: "ToneOptions.frequency" },
      { text: "frequencyToNoteName(frequency, options)" },
      { role: "link", name: "Open tone demo" },
      { role: "link", name: "Recipes" },
      { role: "link", name: "Examples" },
    ],
  },
  {
    path: "/docs/examples",
    heading: "Standalone example apps.",
    metadata: {
      title: "Examples | webaudio-kit",
      description:
        "Standalone webaudio-kit example apps for Vite React, Next App Router, plain React, and audio test mode.",
      ogTitle: "Examples | webaudio-kit",
    },
    checks: [
      { text: "examples/vite-react" },
      { text: "examples/next-app-router" },
      { text: "pnpm examples:check" },
      { role: "link", name: "Framework comparison" },
      { role: "link", name: "Recipes" },
    ],
  },
  {
    path: "/docs/frameworks",
    heading: "Framework setup comparison.",
    metadata: {
      title: "Framework Setup Comparison | webaudio-kit",
      description:
        "Compare webaudio-kit setup patterns for Vite React, Next App Router, and plain React applications.",
      ogTitle: "Framework Setup Comparison | webaudio-kit",
    },
    checks: [
      { text: "Provider placement" },
      { text: "Next App Router client boundary" },
      { text: "Browser autoplay impact" },
      { text: "examples/vite-react" },
      { role: "link", name: "Example apps" },
    ],
  },
  {
    path: "/docs/recipes",
    heading: "Copy-paste audio recipes.",
    metadata: {
      title: "Recipes | webaudio-kit",
      description:
        "Copy-paste webaudio-kit recipes for tone buttons, sweeps, volume controls, visualizers, test mode, and browser autoplay.",
      ogTitle: "Recipes | webaudio-kit",
    },
    checks: [
      { text: "Tone Button" },
      { text: "Safe Autoplay Pattern" },
      { text: "browser autoplay behavior" },
      { role: "link", name: "Examples" },
    ],
  },
  {
    path: "/demos",
    heading: "Focused browser audio workspaces.",
    metadata: {
      title: "Demos | webaudio-kit",
      description:
        "Focused webaudio-kit demos for tone generation, frequency sweeps, noise bursts, volume, pan, pitch helpers, and visualizer output.",
      ogTitle: "Demos | webaudio-kit",
    },
    checks: [
      { role: "link", name: /Tone generator/ },
      { text: "Frequency sweep" },
    ],
  },
  {
    path: "/demos/tone",
    heading: "Tone generator.",
    metadata: {
      title: "Tone generator | webaudio-kit",
      description:
        "Change frequency, gain, pan, and waveform while the analyser confirms the provider graph is live.",
      ogTitle: "Tone generator | webaudio-kit",
    },
    checks: [
      { role: "button", name: "Play tone" },
      { label: "Waveform analyser" },
      { label: "Spectrum analyser" },
    ],
  },
  {
    path: "/demos/visualizer",
    heading: "Visualizer lab.",
    metadata: {
      title: "Visualizer lab | webaudio-kit",
      description:
        "Render waveform and spectrum canvases as the primary surface with a small pulse control for analyser verification.",
      ogTitle: "Visualizer lab | webaudio-kit",
    },
    checks: [
      { role: "button", name: "Pulse visualizer" },
      { label: "Focused waveform analyser" },
      { label: "Focused spectrum analyser" },
    ],
  },
  {
    path: "/demos/pitch",
    heading: "Pitch helper.",
    metadata: {
      title: "Pitch helper | webaudio-kit",
      description:
        "Use frequency clamping and note-name helpers next to playback so pitch UI stays readable.",
      ogTitle: "Pitch helper | webaudio-kit",
    },
    checks: [
      { role: "button", name: "Play pitch" },
      { label: "Pitch frequency" },
      { text: "A4" },
    ],
  },
  {
    path: "/changelog",
    heading: "Release history.",
    metadata: {
      title: "Changelog | webaudio-kit",
      description:
        "Versioned release history for webaudio-kit packages, GitHub Releases, and npm package pages.",
      ogTitle: "Changelog | webaudio-kit",
    },
    checks: [
      { role: "link", name: /GitHub release v\d+\.\d+\.\d+/ },
      { role: "link", name: /@webaudio-kit\/react \d+\.\d+\.\d+/ },
      { text: "Latest package set:" },
    ],
  },
];

export const SITE_QA_VIEWPORTS = [
  { name: "desktop", width: 1440, height: 1100 },
  { name: "mobile", width: 390, height: 844 },
];

const root = resolve(new URL("..", import.meta.url).pathname);
const baseUrl = process.env.SITE_QA_BASE_URL ?? "http://127.0.0.1:4173";

if (isMain(import.meta.url)) {
  await runSiteQa();
}

export async function runSiteQa() {
  const server = spawn("pnpm", ["site:start"], {
    cwd: root,
    detached: process.platform !== "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });

  let serverOutput = "";
  server.stdout.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });
  server.stderr.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });

  try {
    await waitForServer(`${baseUrl}/`, () => serverOutput);
    await runBrowserChecks();
  } finally {
    await stopServer(server);
  }
}

async function stopServer(server) {
  if (server.exitCode !== null || server.signalCode !== null) {
    return;
  }

  const exited = new Promise((resolveExit) => {
    server.once("exit", resolveExit);
  });

  killServer(server, "SIGTERM");
  await Promise.race([
    exited,
    delay(3_000).then(() => {
      killServer(server, "SIGKILL");
    }),
  ]);
}

function killServer(server, signal) {
  const { pid } = server;

  if (!pid) {
    return;
  }

  try {
    if (process.platform === "win32") {
      server.kill(signal);
    } else {
      process.kill(-pid, signal);
    }
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ESRCH") {
      return;
    }

    throw error;
  }
}

async function runBrowserChecks() {
  const browser = await chromium.launch({ headless: true });
  const failures = [];

  try {
    for (const viewport of SITE_QA_VIEWPORTS) {
      for (const route of SITE_QA_ROUTES) {
        try {
          await checkRoute(browser, viewport, route);
        } catch (error) {
          failures.push(
            `${viewport.name} ${route.path}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }
    }
  } finally {
    await browser.close();
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(failure);
    }
    throw new Error("Site QA failed");
  }

  console.log(
    `site qa ok: ${SITE_QA_ROUTES.length} routes x ${SITE_QA_VIEWPORTS.length} viewports`,
  );
}

async function checkRoute(browser, viewport, route) {
  const messages = [];
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10_000);

  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      messages.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    messages.push(`pageerror: ${error.message}`);
  });
  page.on("response", (response) => {
    const status = response.status();
    if (status >= 400) {
      messages.push(`${status}: ${response.url()}`);
    }
  });

  try {
    await page.goto(`${baseUrl}${route.path}`, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: route.heading }).waitFor();

    for (const check of route.checks) {
      if ("role" in check) {
        await page
          .getByRole(check.role, { name: check.name })
          .first()
          .waitFor();
      } else if ("label" in check) {
        await page.getByLabel(check.label).first().waitFor();
      } else {
        await page.getByText(check.text).first().waitFor();
      }
    }

    if (route.metadata) {
      await checkMetadata(page, route.metadata);
    }

    const overflow = await page.evaluate(() => {
      const rootElement = globalThis.document.documentElement;

      return {
        clientWidth: rootElement.clientWidth,
        scrollWidth: rootElement.scrollWidth,
      };
    });
    if (overflow.scrollWidth > overflow.clientWidth + 1) {
      throw new Error(
        `horizontal overflow: ${overflow.scrollWidth}px > ${overflow.clientWidth}px`,
      );
    }

    if (messages.length > 0) {
      throw new Error(`console/network issues: ${messages.join("; ")}`);
    }
  } finally {
    await context.close();
  }
}

async function checkMetadata(page, expected) {
  await expectEqual(await page.title(), expected.title, "title");
  await expectMeta(
    page,
    'meta[name="description"]',
    expected.description,
    "description",
  );
  await expectMeta(
    page,
    'meta[property="og:title"]',
    expected.ogTitle,
    "og:title",
  );
  await expectMeta(
    page,
    'meta[property="og:description"]',
    expected.description,
    "og:description",
  );
  await expectMeta(
    page,
    'meta[name="twitter:card"]',
    "summary_large_image",
    "twitter:card",
  );
  await expectMeta(
    page,
    'meta[name="twitter:title"]',
    expected.ogTitle,
    "twitter:title",
  );
  await expectMeta(
    page,
    'meta[name="twitter:description"]',
    expected.description,
    "twitter:description",
  );

  const ogImage = await page
    .locator('meta[property="og:image"]')
    .first()
    .getAttribute("content");
  if (!ogImage?.includes("/opengraph-image")) {
    throw new Error(`og:image mismatch: ${ogImage ?? "missing"}`);
  }

  const twitterImage = await page
    .locator('meta[name="twitter:image"]')
    .first()
    .getAttribute("content");
  if (!twitterImage?.includes("/opengraph-image")) {
    throw new Error(`twitter:image mismatch: ${twitterImage ?? "missing"}`);
  }
}

async function expectMeta(page, selector, expected, label) {
  const value = await page.locator(selector).first().getAttribute("content");

  await expectEqual(value, expected, label);
}

async function expectEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(
      `${label} mismatch: expected "${expected}", got "${actual}"`,
    );
  }
}

async function waitForServer(url, getServerOutput) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 30_000) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Keep waiting for Next to boot.
    }

    await new Promise((resolveWait) => setTimeout(resolveWait, 250));
  }

  throw new Error(`Next site did not start at ${url}\n${getServerOutput()}`);
}

function delay(ms) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}

function isMain(url) {
  return fileURLToPath(url) === process.argv[1];
}
