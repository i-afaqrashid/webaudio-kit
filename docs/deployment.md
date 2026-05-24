# Deployment

## What To Deploy

The current deployable frontend is `apps/demo`, a Vite React app.

Keep package builds and npm publishing separate from frontend deployment. The
demo site can deploy before the npm packages are public.

## Vercel

Recommended settings:

```txt
Repository: i-afaqrashid/webaudio-kit
Project root: repository root
Framework preset: Vite
Install command: pnpm install --frozen-lockfile
Build command: pnpm demo:build
Output directory: apps/demo/dist
Node version: 22.x or 24.x
Environment variables: none required
```

Do not set the project root to `apps/demo`. The demo imports workspace packages
through pnpm.

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
Build command: pnpm demo:build
Publish directory: apps/demo/dist
Node version: 22.x or 24.x
```

## Post-Deploy QA

Open the deployed site and verify:

- page loads over HTTPS
- tone play button starts sound after click
- stop button stops playback
- sweep runs from 250 Hz to 8000 Hz
- waveform moves during playback
- volume starts at a safe level
- disclaimer is visible
- mobile layout is usable
- console has no application errors

## Future Docs Site

If a dedicated docs app is added later, use:

```txt
apps/docs
```

and keep `apps/demo` as the minimal QA target.
