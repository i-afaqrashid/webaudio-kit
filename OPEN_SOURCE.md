# Open Source Expectations

## Project Scope

`webaudio-kit` is a focused React and TypeScript toolkit for browser audio
interfaces. The first release stays narrow:

- tone playback
- frequency sweeps
- safe volume defaults
- panning
- analyser access
- demo and package smoke checks

Microphone support, AudioWorklets, and medical/hearing-test claims are out of
scope for the first release.

## Maintainer

Primary maintainer: `i-afaqrashid <i.afaqrashid@gmail.com>`.

## Contribution Policy

Contributions should keep the public API small, typed, and browser-safe. Changes
to playback, React hooks, package metadata, release scripts, or safety language
should include tests or release-check documentation.

## Release Policy

Releases should only be tagged after:

- `pnpm verify`
- `pnpm smoke:pack`
- browser demo QA
- changelog update
- package metadata review

See `RELEASE.md` for the full release checklist.
