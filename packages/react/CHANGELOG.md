# Changelog

## 1.5.4 - 2026-05-26

### Added

- Add live recipe demos beside every public recipes page snippet for tone,
  frequency sweep, master volume, visualizer, audio test mode, and autoplay-safe
  start patterns.

### Changed

- Link the source Markdown recipes to the public live recipe demos.

## 1.5.3 - 2026-05-26

### Added

- Add standalone example apps for Vite React, Next App Router, plain React, and
  audio test mode, with package-tarball checks before release.
- Add public example and recipe documentation for tone buttons, sweeps, master
  volume, visualizers, audio test mode, and safe browser autoplay behavior.

### Changed

- Link examples and recipes from the public docs, API reference, and focused
  demo pages, with desktop and mobile site QA coverage for the new routes.
- Point every package README at the public API reference, recipes, examples,
  demos, changelog, GitHub Releases, and npm package pages.
- Expand generated GitHub Release notes with direct API, recipe, example, and
  demo links.

## 1.5.2 - 2026-05-25

### Changed

- Publish releases through npm Trusted Publishing and remove token publishing
  from the normal release path.
- Generate GitHub Release notes from `CHANGELOG.md` during tag publishes and
  upload package tarballs to the release page.
- Add release-history links to every package README so npm package pages point
  users to the full changelog and GitHub Releases.
- Include synchronized `CHANGELOG.md` files in each package tarball.

## 1.5.1 - 2026-05-25

### Fixed

- Prevent stale `useAudioTestMode()` runs from stopping replacement playback after a restart.

### Added

- Add site page tests for the home/docs pages and expanded CLI parser/runtime tests.

## 1.5.0 - 2026-05-25

### Added

- `useAudioTestMode()` and `createDefaultAudioTestModeSteps()` in
  `@webaudio-kit/react` for safe low-gain browser audio diagnostics.
- Test mode panels in the Vite demo and public site demo.
- Standalone `examples/audio-test-mode` Vite example.

### Changed

- Package smoke checks now verify the audio test mode React exports.
- Standalone example checks now build the new audio test mode example from
  packed package tarballs.

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
