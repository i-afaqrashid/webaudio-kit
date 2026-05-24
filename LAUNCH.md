# Launch Checklist

## What Is Live

The repository contains:

- `@webaudio-kit/core`
- `@webaudio-kit/react`
- `@webaudio-kit/cli`
- a Vite React demo in `apps/demo`
- package smoke checks
- browser demo QA
- release automation for tag-gated npm publishing
- documentation for usage, safety, deployment, testing, and troubleshooting

The intended public demo domain is:

```txt
webaudio-kit.afaqrashid.com
```

## Pre-Launch Checks

Run:

```sh
pnpm install --frozen-lockfile
pnpm verify
pnpm smoke:pack
pnpm demo:qa
pnpm release:dry-run
```

Then manually verify:

- tone playback starts only after a user click
- stop silences tone playback
- sweep playback starts and stops correctly
- waveform canvas reacts during playback
- default volume feels safe on low system volume
- disclaimer is visible in the demo
- README install and quick-start examples match the public API
- package READMEs match the packed package contents

## npm Publish Readiness

Before pushing a release tag:

- confirm `@webaudio-kit/core`, `@webaudio-kit/react`, and `@webaudio-kit/cli`
  versions match
- confirm package names are available or already owned by the maintainer
- confirm npm org `@webaudio-kit` exists
- confirm `NPM_TOKEN` can publish without an OTP prompt, or use trusted
  publishing if configured
- confirm GitHub Actions has `id-token: write` in publish workflow permissions
- confirm `CHANGELOG.md` has the release entry

## Demo Site Readiness

For Vercel deployment:

```txt
Install command: pnpm install --frozen-lockfile
Build command: pnpm demo:build
Output directory: apps/demo/dist
Node version: 22.x or 24.x
```

For the custom subdomain:

```txt
Type: CNAME
Name: webaudio-kit
Value: cname.vercel-dns.com
```

Only mark the demo as live after the custom domain resolves over HTTPS.

## Public Copy

Safe one-line description:

```txt
React and TypeScript primitives for serious browser audio apps.
```

Safe longer description:

```txt
webaudio-kit helps React developers build browser audio interfaces with lazy
AudioContext setup, tone generation, frequency sweeps, volume controls,
panning, and analyser data.
```

Required disclaimer for hearing-test-style examples:

```txt
This library is for browser audio interfaces and prototypes. It is not a
certified audiology or medical testing system.
```

## Post-Launch Verification

After npm publish:

```sh
npm view @webaudio-kit/core version
npm view @webaudio-kit/react version
npm view @webaudio-kit/cli version
pnpm dlx create-vite@latest /tmp/webaudio-kit-install-check --template react-ts
```

Install from npm in a clean app and import:

```tsx
import { AudioProvider, useTone } from "@webaudio-kit/react";
```

After demo deployment:

- open `https://webaudio-kit.afaqrashid.com`
- click play tone
- run sweep
- confirm waveform movement
- verify mobile layout
- verify browser console has no application errors

## Rollback

If npm publish fails before either package is visible on npm, fix the workflow
or token and rerun the tag workflow.

If one package publishes and the second fails, do not republish the existing
version. Publish only the missing package or patch the release script to skip
already-published versions before retrying.

If the demo deployment breaks, roll back to the previous Vercel deployment and
open a fix PR.

## Private Material Check

Before launch, search for:

- real tokens or npm auth fragments
- private URLs
- copied private project names
- unsupported medical claims
- personal account names that are not `i-afaqrashid`
