# @webaudio-kit/core

Core browser audio primitives for `webaudio-kit`.

This package has no React dependency. It exposes small helpers for safe Web
Audio tone playback, frequency sweeps, and audio math.

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

## API

- `playTone(context, options, destination?)`
- `playFrequencySweep(context, options, destination?)`
- `dbToGain(db)`
- `gainToDb(gain)`
- `clampFrequency(value, min?, max?)`

`AudioContext` is never created at module import time. Create or resume it from
a user gesture in your app.

This library is for browser audio interfaces and prototypes. It is not a
certified audiology or medical testing system.
