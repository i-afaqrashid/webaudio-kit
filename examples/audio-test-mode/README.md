# webaudio-kit Audio Test Mode Example

Small Vite example showing `useAudioTestMode()` with waveform and spectrum
canvases.

## What it shows

- short low-gain sequence from a user click
- active step display
- manual stop behavior
- master volume reset
- analyser-driven waveform and spectrum output

## Run in StackBlitz

https://stackblitz.com/fork/github/i-afaqrashid/webaudio-kit/tree/main/examples/audio-test-mode?title=webaudio-kit%20Audio%20test%20mode

## Run

```sh
pnpm install
pnpm build
pnpm --filter webaudio-kit-audio-test-mode-example dev
```

The example runs a short low-gain browser audio diagnostic sequence for tone
output, stereo pan, sweep scheduling, noise buffers, and analyser routing.

This is not medical or audiology software.
