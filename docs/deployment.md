# Deployment

## What To Deploy

The primary deployable frontend is `apps/site`, a Next.js public site. Keep
`apps/demo` available as the local and preview audio QA surface.

Keep package builds and npm publishing separate from frontend deployment. The
site can deploy before the npm packages are public.

## Vercel

Recommended settings:

```txt
Repository: i-afaqrashid/webaudio-kit
Project root: apps/site
Framework preset: Next.js
Install command: pnpm install --frozen-lockfile
Build command: pnpm build
Node version: 22.x or 24.x
Environment variables: none required
```

The repository also has a root `pnpm site:build` helper for local and CI use.
Use `pnpm build` in Vercel when the Vercel root directory is `apps/site`.

## Custom Domain

Recommended domain:

```txt
webaudio-kit.afaqrashid.com
```

Add the domain in Vercel project settings, then add this DNS record wherever
`afaqrashid.com` is managed:

```txt
Type: CNAME
Name: webaudio-kit
Value: cname.vercel-dns.com
```

Wait for DNS and HTTPS provisioning to finish before sharing the URL.

## Netlify

Equivalent settings:

```txt
Base directory: repository root
Build command: pnpm site:build
Publish directory: apps/site/.next
Node version: 22.x or 24.x
```

## Post-Deploy QA

Open the deployed site and verify:

- page loads over HTTPS
- home page renders the interactive demo
- docs page renders install and API sections
- disclaimer is visible
- mobile layout is usable
- console has no application errors

## Demo Preview QA

For a preview deployment of the audio demo, use a separate Vercel project:

```txt
Framework preset: Vite
Build command: pnpm demo:build
Output directory: apps/demo/dist
```

Then manually verify:

- tone play button starts sound after click
- stop button stops playback
- sweep runs from 250 Hz to 8000 Hz
- waveform moves during playback
- volume starts at a safe level
