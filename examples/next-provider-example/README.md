# Next provider example

This example shows the boundary that matters in Next.js: Web Audio hooks are
client-only, so the provider and controls live in a `"use client"` component.

```tsx
// app/audio-controls.tsx
"use client";

import {
  AudioProvider,
  SpectrumCanvas,
  WaveformCanvas,
  useTone,
} from "@webaudio-kit/react";

function ToneButton() {
  const tone = useTone({ frequency: 440, gain: 0.15 });

  return (
    <button type="button" onClick={() => void tone.play()}>
      Play tone
    </button>
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
