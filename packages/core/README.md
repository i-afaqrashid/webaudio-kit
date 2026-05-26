# @webaudio-kit/core

Core browser audio primitives for `webaudio-kit`.

This package has no React dependency. It exposes small helpers for safe Web
Audio tone playback, frequency sweeps, short noise buffers, pitch helpers, and
audio math.

## Install

```sh
pnpm add @webaudio-kit/core
```

## Example

```ts
import { playTone } from "@webaudio-kit/core";

const context = new AudioContext();
const handle = playTone(context, {
  frequency: 440,
  gain: 0.2,
  type: "sine",
});

handle.stop();
```

Create or resume `AudioContext` from a user gesture in your app. This package
does not create audio at module import time.

## Repeat Patterns

Tone, sweep, and noise playback accept `pattern: { repeat, gapMs }` for
notification-style cues. `repeat` is the total number of plays, and `gapMs` is
the silence between plays.

```ts
const handle = playTone(context, {
  frequency: 880,
  durationMs: 120,
  gain: 0.12,
  type: "square",
  envelope: { attackMs: 8, releaseMs: 45 },
  pattern: { repeat: 3, gapMs: 90 },
});

handle.stop(); // stops the current and future scheduled voices
```

## Envelopes

Use `envelope` to fade generated cues in and out. Attack, decay, and release
values are milliseconds. `sustain` is a `0..1` multiplier of the requested gain.

```ts
playFrequencySweep(context, {
  from: 440,
  to: 880,
  durationMs: 500,
  gain: 0.12,
  envelope: { attackMs: 10, decayMs: 40, sustain: 0.7, releaseMs: 80 },
});
```

## Browser Gesture Setup

```ts
import {
  frequencyToNoteName,
  playFrequencySweep,
  playTone,
} from "@webaudio-kit/core";

const button = document.querySelector<HTMLButtonElement>("#play")!;
const context = new AudioContext();

button.addEventListener("click", async () => {
  await context.resume();

  playTone(context, { frequency: 440, gain: 0.12, durationMs: 500 });
  playFrequencySweep(context, {
    from: 250,
    to: 8000,
    durationMs: 1600,
    gain: 0.08,
  });

  console.log(frequencyToNoteName(440));
});
```

## API

- `playTone(context, options, destination?)`
- `playFrequencySweep(context, options, destination?)`
- `playNoise(context, options, destination?)`
- `dbToGain(db)`
- `gainToDb(gain)`
- `clampFrequency(value, min?, max?)`
- `midiToFrequency(midiNote, concertA?)`
- `frequencyToMidi(frequency, concertA?)`
- `frequencyToNoteName(frequency, options?)`

## Docs And Examples

- API reference: https://webaudio-kit.afaqrashid.com/docs/api
- Recipes: https://webaudio-kit.afaqrashid.com/docs/recipes
- Example apps: https://webaudio-kit.afaqrashid.com/docs/examples
- Interactive demos: https://webaudio-kit.afaqrashid.com/demos

## Release History

Every npm version maps to a GitHub tag and a `CHANGELOG.md` section.

- Changelog: https://webaudio-kit.afaqrashid.com/changelog
- GitHub Releases: https://github.com/i-afaqrashid/webaudio-kit/releases
- npm versions: https://www.npmjs.com/package/@webaudio-kit/core?activeTab=versions

The published npm tarball includes `CHANGELOG.md` so version history is
available with the package contents.

This library is for browser audio interfaces and prototypes. It is not a
certified audiology or medical testing system.
