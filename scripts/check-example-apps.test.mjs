import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { join } from "node:path";

const expectedExamples = [
  "vite-react",
  "next-app-router",
  "plain-react",
  "incident-alert-console",
];
const packageVersion = JSON.parse(readFileSync("package.json", "utf8")).version;
const stackBlitzBase =
  "https://stackblitz.com/fork/github/i-afaqrashid/webaudio-kit/tree/main/examples";

test("standalone framework examples are documented and checked", () => {
  const checker = readFileSync("scripts/check-example-apps.mjs", "utf8");
  const examplesReadme = readFileSync("examples/README.md", "utf8");
  const docsExamples = readFileSync("docs/examples.md", "utf8");

  for (const example of expectedExamples) {
    const directory = join("examples", example);
    assert.equal(existsSync(directory), true, `${directory} must exist`);
    assert.match(checker, new RegExp(`"${example}"`));
    assert.match(examplesReadme, new RegExp(`\`${example}\``));
    assert.match(docsExamples, new RegExp(`examples/${example}`));

    const manifestPath = join(directory, "package.json");
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    assert.equal(manifest.private, true);
    assert.equal(
      manifest.dependencies["@webaudio-kit/react"],
      `^${packageVersion}`,
      `${manifestPath} should use the current published package range`,
    );
    assert.doesNotMatch(
      JSON.stringify(manifest.dependencies),
      /workspace:|file:|link:|portal:/,
      `${manifestPath} should not use local workspace shortcuts`,
    );

    const readme = readFileSync(join(directory, "README.md"), "utf8");
    assert.match(readme, /pnpm examples:check/);
    assert.match(readme, /@webaudio-kit\/react/);
    assert.match(readme, new RegExp(`${stackBlitzBase}/${example}`));
  }
});

test("docs expose one-click browser examples", () => {
  const readme = readFileSync("README.md", "utf8");
  const examplesReadme = readFileSync("examples/README.md", "utf8");
  const docsExamples = readFileSync("docs/examples.md", "utf8");
  const newRoute = readFileSync("apps/site/app/new/route.ts", "utf8");

  for (const content of [readme, examplesReadme, docsExamples]) {
    assert.match(content, /Run in StackBlitz/);
    assert.match(content, new RegExp(`${stackBlitzBase}/vite-react`));
    assert.match(content, new RegExp(`${stackBlitzBase}/next-app-router`));
    assert.match(
      content,
      new RegExp(`${stackBlitzBase}/incident-alert-console`),
    );
  }

  assert.match(readme, /https:\/\/webaudio-kit\.afaqrashid\.com\/new/);
  assert.match(newRoute, new RegExp(`${stackBlitzBase}/vite-react`));
});

test("site examples page embeds source-backed snippets", () => {
  const sitePage = readFileSync("apps/site/app/docs/examples/page.tsx", "utf8");

  for (const example of [
    {
      file: "examples/vite-react/src/main.tsx",
      markers: [
        "function AudioWorkbench()",
        "WaveformCanvas",
        "SpectrumCanvas",
      ],
      snippetTitle: "Vite React source excerpt",
    },
    {
      file: "examples/next-app-router/app/audio-controls.tsx",
      markers: ['"use client";', "function Controls()", "AudioProvider"],
      snippetTitle: "Next App Router source excerpt",
    },
    {
      file: "examples/incident-alert-console/src/main.tsx",
      markers: ["function IncidentConsole()", "useAudioContext()", "Stop cues"],
      snippetTitle: "Incident console source excerpt",
    },
  ]) {
    const source = readFileSync(example.file, "utf8");

    assert.match(sitePage, new RegExp(`snippetPath: "${example.file}"`));
    assert.match(sitePage, new RegExp(example.snippetTitle));
    assert.match(
      sitePage,
      new RegExp(
        `https://github.com/i-afaqrashid/webaudio-kit/blob/main/${example.file}`,
      ),
    );

    for (const marker of example.markers) {
      assert.match(source, new RegExp(escapeRegExp(marker)));
      assert.match(sitePage, new RegExp(escapeRegExp(marker)));
    }
  }
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
