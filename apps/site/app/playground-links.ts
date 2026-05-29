export type PlaygroundExample = {
  codeSandboxUrl: string;
  copy: string;
  path: string;
  title: string;
  url: string;
};

const githubSlug = "i-afaqrashid/webaudio-kit";
const githubBranch = "main";

const stackBlitzBase = `https://stackblitz.com/fork/github/${githubSlug}/tree/${githubBranch}`;

function stackBlitzExampleUrl(path: string, title: string) {
  const encodedTitle = encodeURIComponent(`webaudio-kit ${title}`);

  return `${stackBlitzBase}/${path}?title=${encodedTitle}`;
}

function codeSandboxExampleUrl(path: string) {
  // CodeSandbox imports a subfolder of a GitHub repo via the /s/github route.
  return `https://codesandbox.io/s/github/${githubSlug}/tree/${githubBranch}/${path}`;
}

// Replit imports a whole repository, not a subfolder, so this is repo-level.
export const replitRepoUrl = `https://replit.com/github/${githubSlug}`;

type PlaygroundSeed = {
  copy: string;
  path: string;
  title: string;
};

const seeds: PlaygroundSeed[] = [
  {
    path: "examples/vite-react",
    title: "Vite React starter",
    copy: "Tone, sweep, noise, volume, waveform, and spectrum controls in a small Vite app.",
  },
  {
    path: "examples/next-app-router",
    title: "Next App Router starter",
    copy: "Server/client boundary example for AudioProvider, hooks, and visualizer canvases.",
  },
  {
    path: "examples/incident-alert-console",
    title: "Incident Alert Console",
    copy: "Product-style monitoring console with severity cues, volume control, context state, and analyser output.",
  },
  {
    path: "examples/audio-test-mode",
    title: "Audio test mode",
    copy: "Safe diagnostic sequence for tone, pan, sweep, noise, and analyser checks.",
  },
];

export const playgroundExamples: PlaygroundExample[] = seeds.map((seed) => ({
  ...seed,
  url: stackBlitzExampleUrl(seed.path, seed.title),
  codeSandboxUrl: codeSandboxExampleUrl(seed.path),
}));

export const stackBlitzStarterUrl = playgroundExamples[0]!.url;
