#!/usr/bin/env node
import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { chromium, firefox, webkit } from "playwright";

const root = resolve(new URL("..", import.meta.url).pathname);
const baseUrl = "http://127.0.0.1:5173/";
const outputDir = resolve(root, "output/playwright");
const assetDir = resolve(root, "docs/assets");
const videoDir = resolve(outputDir, "videos");
const screenshotPath = resolve(assetDir, "demo-screenshot.png");
const webmPath = resolve(assetDir, "demo.webm");
const gifPath = resolve(assetDir, "demo.gif");

await mkdir(outputDir, { recursive: true });
await mkdir(assetDir, { recursive: true });
await rm(videoDir, { recursive: true, force: true });
await mkdir(videoDir, { recursive: true });

const server = spawn("pnpm", ["--filter", "@webaudio-kit/demo", "dev"], {
  cwd: root,
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
  await waitForServer(baseUrl);
  const requestedBrowsers = new Set(
    (process.env.DEMO_QA_BROWSERS ?? "chromium,firefox,webkit")
      .split(",")
      .map((browserName) => browserName.trim())
      .filter(Boolean),
  );
  const browsers = [
    { name: "chromium", type: chromium, artifacts: true, waitForAudioUi: true },
    { name: "firefox", type: firefox, artifacts: false, waitForAudioUi: false },
    { name: "webkit", type: webkit, artifacts: false, waitForAudioUi: true },
  ].filter((browser) => requestedBrowsers.has(browser.name));

  if (browsers.length === 0) {
    throw new Error(
      `No supported browsers requested by DEMO_QA_BROWSERS=${process.env.DEMO_QA_BROWSERS}`,
    );
  }

  const results = [];
  for (const browser of browsers) {
    results.push(await runBrowserQa(browser));
  }

  const failed = results.filter((result) => !result.ok);
  if (failed.length > 0) {
    for (const result of failed) {
      console.error(`${result.name} failed: ${result.error}`);
    }
    throw new Error("Demo QA failed");
  }

  console.log(`demo qa ok: ${results.map((result) => result.name).join(", ")}`);
} finally {
  server.kill("SIGTERM");
}

async function runBrowserQa({ name, type, artifacts, waitForAudioUi }) {
  let browser;
  let video;

  try {
    browser = await type.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      ...(artifacts
        ? { recordVideo: { dir: videoDir, size: { width: 1280, height: 900 } } }
        : {}),
    });
    const page = await context.newPage();

    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Play tone" }).click();
    if (waitForAudioUi) {
      await page.getByText("Restart tone").waitFor();
    }
    await page.locator('label:has-text("Frequency") input').fill("880");
    await page.locator('label:has-text("Gain") input').fill("-18");
    await page.locator('label:has-text("Pan") input').fill("0.4");
    await page.getByRole("button", { name: "Stop" }).first().click();
    await page.getByRole("button", { name: "Run sweep" }).click();
    if (waitForAudioUi) {
      await page.getByText("Restart sweep").waitFor();
    }
    await page.waitForTimeout(800);
    await page.getByRole("button", { name: "pink" }).click();
    await page.getByRole("button", { name: "Play noise" }).click();
    if (waitForAudioUi) {
      await page.getByText("Restart noise").waitFor();
    }
    await page.waitForTimeout(500);
    await page.getByRole("button", { name: "Run test mode" }).click();
    if (waitForAudioUi) {
      await page.getByText("Running: Center tone").waitFor();
    }
    await page.waitForTimeout(500);
    await page.getByRole("button", { name: "Stop test mode" }).click();
    if (waitForAudioUi) {
      await page.getByText("Idle").waitFor();
    }

    const waveformVisible = await page
      .getByLabel("Waveform analyser")
      .isVisible();
    if (!waveformVisible) {
      throw new Error("waveform canvas is not visible");
    }
    const spectrumVisible = await page
      .getByLabel("Spectrum analyser")
      .isVisible();
    if (!spectrumVisible) {
      throw new Error("spectrum canvas is not visible");
    }

    if (artifacts) {
      await page.screenshot({ path: screenshotPath, fullPage: true });
      video = page.video();
    }

    await context.close();
    await browser.close();
    browser = undefined;

    if (video) {
      const recordedPath = await video.path();
      await cp(recordedPath, webmPath);
      convertVideoToGif(webmPath, gifPath);
    }

    return { name, ok: true };
  } catch (error) {
    if (browser) {
      await browser.close();
    }

    return {
      name,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function waitForServer(url) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 20_000) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Keep waiting for Vite to boot.
    }

    await new Promise((resolveWait) => setTimeout(resolveWait, 250));
  }

  throw new Error(`Vite demo did not start at ${url}\n${serverOutput}`);
}

function convertVideoToGif(input, output) {
  const ffmpeg = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-i",
      input,
      "-vf",
      "fps=12,scale=900:-1:flags=lanczos",
      "-loop",
      "0",
      output,
    ],
    { stdio: "inherit" },
  );

  if (ffmpeg.status !== 0) {
    throw new Error("ffmpeg failed to create demo GIF");
  }
}
