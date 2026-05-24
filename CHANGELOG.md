# Changelog

## 1.4.1 - 2026-05-25

### Fixed

- `webaudio-kit` CLI bin execution now works through package-manager symlinks
  in `node_modules/.bin`.
- CLI tests now cover symlinked bin entrypoint detection.

## 1.4.0 - 2026-05-25

### Added

- `@webaudio-kit/cli` with `webaudio-kit agent-brief` for generating an
  `AGENTS.md` style brief for Codex, Claude Code, Gemini CLI, OpenCode,
  Antigravity, and similar coding agents.
- Agent brief documentation covering package links, docs links, safe browser
  audio guidance, framework notes, and generated prompt content.

### Changed

- Release tag verification, npm publish ordering, and package smoke checks now
  include the CLI package and validate the generated command output from a
  packed tarball.
- Public docs and launch material now list the CLI alongside the core and React
  packages.

## 1.3.0 - 2026-05-24

### Added

- `playNoise()` in `@webaudio-kit/core` for short white, pink, and brown noise
  buffers routed through gain, pan, and destination nodes.
- `useNoise()` in `@webaudio-kit/react` with stable `play`, `stop`, and
  `isPlaying` controls.
- Pitch helper utilities: `midiToFrequency()`, `frequencyToMidi()`, and
  `frequencyToNoteName()`.

### Changed

- Demo app, public site, docs, and standalone examples now include noise
  playback controls and note-name frequency readouts.
- Package smoke checks now verify the new public exports.

## 1.2.0 - 2026-05-24

### Added

- `SpectrumCanvas` in `@webaudio-kit/react` for reusable analyser frequency
  bar rendering with an idle state before playback starts.
- Standalone Vite and Next example package checks that install generated
  tarballs before building.

### Changed

- Demo app, public site, docs, and examples now show both waveform and spectrum
  analyser views.
- `@webaudio-kit/react` now preserves a package-level `"use client"` directive
  for Next.js App Router client boundaries.
- React peer dependency now supports React 18.3 and newer.
- CI and npm publish workflows now build standalone examples before accepting a
  package release.

## 1.1.0 - 2026-05-24

### Added

- `WaveformCanvas` in `@webaudio-kit/react` for reusable analyser waveform
  rendering with an idle state before playback starts.
- Package smoke coverage for the new `WaveformCanvas` public export.

### Changed

- Vite demo and public site now use the shared `WaveformCanvas` component
  instead of duplicating canvas drawing logic.
- Public site navigation no longer includes a roadmap page.

## 1.0.0 - 2026-05-24

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
