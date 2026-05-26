#!/usr/bin/env node
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

export const SITE_QA_ROUTES = [
  {
    path: "/",
    heading: "Browser tones and sweeps without fighting AudioContext.",
    checks: [
      { role: "button", name: "Play tone" },
      { label: "Waveform analyser" },
      { text: "Latest release" },
    ],
  },
  {
    path: "/docs",
    heading: "Install, wrap, play, stop.",
    checks: [
      { role: "link", name: "API reference" },
      { role: "link", name: "Release history" },
      { text: "Audio test mode" },
    ],
  },
  {
    path: "/docs/api",
    heading: "Public API reference.",
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
    checks: [
      { text: "examples/vite-react" },
      { text: "examples/next-app-router" },
      { text: "pnpm examples:check" },
      { role: "link", name: "Recipes" },
    ],
  },
  {
    path: "/docs/recipes",
    heading: "Copy-paste audio recipes.",
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
    checks: [
      { role: "link", name: /Tone generator/ },
      { text: "Frequency sweep" },
    ],
  },
  {
    path: "/demos/tone",
    heading: "Tone generator.",
    checks: [
      { role: "button", name: "Play tone" },
      { label: "Waveform analyser" },
      { label: "Spectrum analyser" },
    ],
  },
  {
    path: "/demos/visualizer",
    heading: "Visualizer lab.",
    checks: [
      { role: "button", name: "Pulse visualizer" },
      { label: "Focused waveform analyser" },
      { label: "Focused spectrum analyser" },
    ],
  },
  {
    path: "/demos/pitch",
    heading: "Pitch helper.",
    checks: [
      { role: "button", name: "Play pitch" },
      { label: "Pitch frequency" },
      { text: "A4" },
    ],
  },
  {
    path: "/changelog",
    heading: "Release history.",
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
