export type PlaygroundExample = {
  copy: string;
  path: string;
  title: string;
  url: string;
};

const stackBlitzBase =
  "https://stackblitz.com/fork/github/i-afaqrashid/webaudio-kit/tree/main";

function stackBlitzExampleUrl(path: string, title: string) {
  const encodedTitle = encodeURIComponent(`webaudio-kit ${title}`);

  return `${stackBlitzBase}/${path}?title=${encodedTitle}`;
}

export const playgroundExamples: PlaygroundExample[] = [
  {
    path: "examples/vite-react",
    title: "Vite React starter",
    copy: "Tone, sweep, noise, volume, waveform, and spectrum controls in a small Vite app.",
    url: stackBlitzExampleUrl("examples/vite-react", "Vite React starter"),
  },
  {
    path: "examples/next-app-router",
    title: "Next App Router starter",
    copy: "Server/client boundary example for AudioProvider, hooks, and visualizer canvases.",
    url: stackBlitzExampleUrl(
      "examples/next-app-router",
      "Next App Router starter",
    ),
  },
  {
    path: "examples/incident-alert-console",
    title: "Incident Alert Console",
    copy: "Product-style monitoring console with severity cues, volume control, context state, and analyser output.",
    url: stackBlitzExampleUrl(
      "examples/incident-alert-console",
      "Incident Alert Console",
    ),
  },
  {
    path: "examples/audio-test-mode",
    title: "Audio test mode",
    copy: "Safe diagnostic sequence for tone, pan, sweep, noise, and analyser checks.",
    url: stackBlitzExampleUrl("examples/audio-test-mode", "Audio test mode"),
  },
];

export const stackBlitzStarterUrl = playgroundExamples[0]!.url;
