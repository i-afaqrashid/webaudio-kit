# Browser Audio Guide

## Autoplay

Browsers usually block audio until a user gesture occurs. This is normal.

Call `play()` from:

- click
- pointer down
- touch
- keyboard action
- another direct user-triggered event

Do not expect audio to start from:

- module import
- initial render
- `useEffect` on page load
- background timers

## Lazy `AudioContext`

`AudioProvider` creates `AudioContext` only when `ensureAudioContext()` is
needed by playback or volume actions.

This avoids:

- import-time browser side effects
- autoplay policy violations
- server-side rendering crashes
- unused audio contexts in routes that never play sound

## Suspended Contexts

Some browsers create an audio context in `suspended` state. The provider calls
`resume()` when playback starts.

If sound does not play:

- confirm the call happens from a click
- confirm the browser tab is not muted
- confirm system volume is low but audible
- check the console for Web Audio errors

## Safari Notes

Safari can be stricter about user gestures and device routing. Keep playback
actions directly connected to buttons. Avoid wrapping initial playback in a
delayed promise chain if possible.

## Firefox Notes

Firefox can keep a context suspended until interaction is clearly user-driven.
The demo QA covers Firefox behavior, but manual listening is still required.

## SSR And Frameworks

The package is designed for browser usage. If you use a framework with server
rendering, render `AudioProvider` only in client components or client-side
routes.

For Next.js App Router:

```tsx
"use client";

import { AudioProvider } from "@webaudio-kit/react";
```

## Permissions

The current release does not request microphone permissions. Playback-only APIs
do not need microphone access.
