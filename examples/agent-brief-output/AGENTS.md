# webaudio-kit Agent Brief

Use this brief with Codex, Claude Code, Gemini CLI, OpenCode, Antigravity, or
another coding agent before changing a project that uses webaudio-kit.

Target agent: Codex.

## Read First

- GitHub: https://github.com/i-afaqrashid/webaudio-kit
- Docs: https://webaudio-kit.afaqrashid.com/docs
- Demos: https://webaudio-kit.afaqrashid.com/demos
- Core package: https://www.npmjs.com/package/@webaudio-kit/core
- React package: https://www.npmjs.com/package/@webaudio-kit/react
- Examples: https://github.com/i-afaqrashid/webaudio-kit/tree/main/examples

Ask the agent to read the docs, demos, and examples before changing code.
Prefer the latest public API over copying package internals.

## Install

```sh
pnpm add @webaudio-kit/core @webaudio-kit/react
```

## Safe Browser Audio Rules

- Keep no import-time AudioContext creation.
- Create or resume audio only after a user gesture.
- Keep first-run volume low.
- Clamp playable frequencies unless the product has a strong reason otherwise.
- Treat webaudio-kit as browser audio prototype tooling, not certified medical
  or audiology software.

## Useful APIs

- Playback: `useTone`, `useFrequencySweep`, `useNoise`
- State and routing: `AudioProvider`, `useAudioContext`, `useVolume`,
  `useAnalyser`
- Visualizers: `WaveformCanvas`, `SpectrumCanvas`
- Helpers: `dbToGain`, `gainToDb`, `clampFrequency`, `frequencyToNoteName`

## Suggested Agent Prompt

You are working in a React or TypeScript app that uses webaudio-kit. Read the
public docs, demo pages, npm package pages, and examples linked above before
editing. Preserve lazy AudioContext behavior, safe default gain, browser
autoplay compatibility, and the non-medical scope boundary. Prefer public APIs
from `@webaudio-kit/core` and `@webaudio-kit/react`.
