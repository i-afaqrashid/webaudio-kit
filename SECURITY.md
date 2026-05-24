# Security Policy

## Supported Versions

Security fixes target the current unreleased `0.1.x` line until the first public
npm release exists. After publishing, supported versions will be documented here
by semver range.

## Reporting a Vulnerability

Please report security issues privately instead of opening a public issue.

Use one of these channels:

- GitHub private vulnerability reporting, if enabled on the repository.
- Email `i.afaqrashid@gmail.com`.

Include:

- Affected package: `@webaudio-kit/core`, `@webaudio-kit/react`, or demo/docs.
- A clear reproduction.
- Browser and operating system.
- Expected impact.

Do not include unrelated personal data, credentials, or private audio/medical
data in reports.

## Project-Specific Security Notes

- The library must not create `AudioContext` at module import time.
- Playback must remain user-gesture driven to respect browser autoplay rules.
- Default playback gain should stay quiet.
- This project is not certified audiology or medical testing software.
