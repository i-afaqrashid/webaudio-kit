# Governance

## Decision Making

`webaudio-kit` is maintained by `i-afaqrashid <i.afaqrashid@gmail.com>`.

Project decisions should optimize for:

- browser-safe audio behavior
- small public APIs
- clear React ergonomics
- responsible safety language
- predictable release automation

When a change expands the public API, prefer an issue or PR discussion before
merging. The first stable line should stay focused on tone generation,
frequency sweeps, volume, panning, and analyser access.

## Release Ownership

The maintainer owns npm publishing, release tags, GitHub repository rules, and
package metadata. Contributors can help prepare release PRs, but tags and npm
publishes should only happen after the release checklist passes.

Release decisions must account for:

- package build output
- smoke-packed tarballs
- browser demo QA
- manual audio safety checks
- changelog accuracy
- npm scope access

## Package Ownership

`@webaudio-kit/core` owns browser audio primitives and math helpers. It must not
depend on React and must not create `AudioContext` at import time.

`@webaudio-kit/react` owns provider and hook ergonomics. It should keep browser
autoplay behavior in mind by lazily creating and resuming `AudioContext` from
user-triggered actions.

Demo and docs code can be more illustrative, but it must not make medical,
audiology, diagnostic, or calibration claims.

## Conduct

The code of conduct applies to issues, pull requests, discussions, release
work, and docs contributions. See `CODE_OF_CONDUCT.md`.
