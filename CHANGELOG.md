# Changelog

## 1.0.0 - Unreleased

### Added

- `@webaudio-kit/core` with tone playback, frequency sweep playback, and audio
  math helpers.
- `@webaudio-kit/react` with `AudioProvider`, `useTone`,
  `useFrequencySweep`, `useVolume`, `useAnalyser`, and `useAudioContext`.
- Vite demo with tone controls, sweep controls, analyser canvas, and safety
  disclaimer.
- CI, package smoke checks, and browser demo QA scripts.
- Broader unit coverage for core playback, React hooks, provider lifecycle, and
  the demo app.
- Release, security, support, testing, conduct, issue template, and npm publish
  workflow documentation.
- Full local release rehearsal command with browser demo QA.
- Local npm publish dry-run command for generated tarballs.
- `cms-lab`-style CI cache, Dependabot, CodeQL, PR template, strict tag
  verification, and ordered publish guardrails.
- Latest dependency/tooling pins, including `pnpm@11.3.0`, `jsdom@29.1.1`,
  React `19.2.6`, and latest GitHub Action tag pins.
