# Next provider example

This example shows the boundary that matters in Next.js: Web Audio hooks are
client-only, so the provider and controls live in a `"use client"` component.

## Run

```sh
pnpm install
pnpm build
pnpm --filter webaudio-kit-next-provider-example dev
```

## Files

```tsx
// app/audio-controls.tsx
"use client";

import {
  AudioProvider,
  SpectrumCanvas,
  WaveformCanvas,
  useNoise,
  useTone,
} from "@webaudio-kit/react";

function ToneButton() {
  const tone = useTone({ frequency: 440, gain: 0.15 });
  const noise = useNoise({ type: "pink", durationMs: 800, gain: 0.08 });

  return (
    <>
      <button type="button" onClick={() => void tone.play()}>
        Play tone
      </button>
      <button type="button" onClick={() => void noise.play()}>
        Play pink noise
      </button>
    </>
  );
}

export function AudioControls() {
  return (
    <AudioProvider>
      <ToneButton />
      <WaveformCanvas />
      <SpectrumCanvas />
    </AudioProvider>
  );
}
```

```tsx
// app/page.tsx
import { AudioControls } from "./audio-controls";

export default function Page() {
  return <AudioControls />;
}
```

Do not create `AudioContext` in a server component or at module import time.
Start playback from a button click so browser autoplay policy can allow audio.
