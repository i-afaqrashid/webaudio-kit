# webaudio-kit Growth Plan

This plan is for ethical, developer-focused distribution. The goal is to make
`webaudio-kit` easy to discover, easy to try, and credible enough that React
and Web Audio developers want to test it.

Do not use fake stars, mass DMs, repeated link drops, vote requests, or medical
claims. The fastest durable path is a strong demo, clear docs, honest technical
writing, and targeted community feedback.

## Current State

- Repo: <https://github.com/i-afaqrashid/webaudio-kit>
- Site: <https://webaudio-kit.afaqrashid.com>
- Packages:
  - `@webaudio-kit/core`
  - `@webaudio-kit/react`
  - `@webaudio-kit/cli`
- GitHub homepage is set to the custom domain.
- GitHub Discussions are enabled.
- Discovery topics include:
  - `audio`
  - `browser`
  - `frequency-sweep`
  - `react`
  - `tone-generator`
  - `typescript`
  - `web-audio`
  - `webaudio`
  - `audio-visualizer`
  - `browser-api`
  - `frontend`
  - `nextjs`
  - `npm-package`
  - `oscillator`
  - `react-hooks`
  - `web-audio-api`

The repo is still early. The category is real, but the public footprint needs
launch assets, search-friendly examples, and repeated useful posts.

## Positioning

Use this primary angle:

> React and TypeScript primitives for serious browser audio apps.

Use this longer version:

> webaudio-kit helps React developers build browser audio interfaces with lazy
> AudioContext setup, tone generation, frequency sweeps, volume controls,
> panning, analyser data, and test-mode helpers.

Do not position it as a replacement for every browser audio library. A better
position is:

- smaller and more React-focused than broad music/audio frameworks
- safer first-run defaults for UI prototypes
- practical hooks for tone/sweep/analyser workflows
- demo-first and TypeScript-first

Avoid:

- "medical hearing test software"
- "certified audiology tooling"
- "full DAW/synth framework"
- "the only Web Audio library you need"

## Immediate Fixes

These should happen before broad promotion:

- Add a GitHub social preview image.
- Add npm/CI/license badges near the top of the README.
- Add a fair comparison doc:
  - `webaudio-kit` vs `Tone.js`
  - `webaudio-kit` vs `howler`
  - `webaudio-kit` vs `use-sound`
  - `webaudio-kit` vs raw Web Audio API
- Update package `homepage` metadata to the docs site in the next patch release.
- Add more SEO-friendly docs pages:
  - `React tone generator`
  - `Next.js Web Audio provider`
  - `React frequency sweep`
  - `React waveform visualizer`
  - `Web Audio autoplay in React`

## Launch Assets

Create these before posting widely:

- 45 second demo video or GIF:
  - install package
  - import `AudioProvider` and `useTone`
  - click play
  - change frequency
  - run a sweep
  - show waveform movement
- 4 screenshots:
  - tone generator
  - frequency sweep
  - analyser waveform
  - Next.js example
- 3 paste-ready snippets:
  - React tone button
  - Next.js provider setup
  - analyser canvas
- 1 short `Show HN` post
- 1 longer technical article
- 1 Product Hunt description
- 1 Reddit self-post draft

## Distribution Order

### 1. Technical Article First

Publish a useful article before asking for attention elsewhere.

Good titles:

- Build a tone generator in React with the Web Audio API
- Managing AudioContext safely in React
- Frequency sweeps in the browser with React and TypeScript

Good places:

- Dev.to
- Hashnode
- personal blog if available

The article should solve a real problem and only mention the package where it
helps.

### 2. Hacker News Show HN

Use a working demo, not a landing page only.

Suggested title:

```txt
Show HN: webaudio-kit - React primitives for browser audio tools
```

Suggested body:

```txt
I built a small React + TypeScript library around the Web Audio API.

It focuses on lazy AudioContext setup, tone generation, frequency sweeps,
volume/pan controls, analyser data, and test-mode helpers for React apps.

The goal is not to replace Tone.js or howler. It is a small set of primitives
for building browser audio interfaces without wiring the same provider graph
every time.

Demo: https://webaudio-kit.afaqrashid.com
Repo: https://github.com/i-afaqrashid/webaudio-kit
```

Do not ask anyone to upvote it.

### 3. Reddit Carefully

Use one or two high-fit communities only. Post as a self-post, not a drive-by
link.

Possible communities:

- `r/reactjs`
- `r/javascript`
- `r/webdev`
- `r/opensource`

Suggested angle:

```txt
I built a small React/Web Audio package and would like feedback on the API.
The main thing I am trying to solve is safe lazy AudioContext setup plus simple
tone/sweep/analyser hooks.
```

Do not post the same copy everywhere.

### 4. Product Hunt Later

Product Hunt is less important than developer channels for this library. Use it
after the demo, GIF/video, README, and comparison docs are polished.

Launch only when the project has:

- a strong visual demo
- a clear tagline
- screenshots
- a short video
- a stable docs URL

Do not ask people directly for upvotes.

### 5. Awesome Lists and Example Hubs

Submit only if the repo clearly fits each list.

Potential targets:

- Awesome Web Audio lists
- React component/library lists
- frontend tooling lists
- StackBlitz examples
- CodeSandbox examples

The PR should be short, honest, and focused on why the library belongs.

## Content Loop

Each feature should create four assets:

1. Code
2. Demo
3. Short post
4. Longer tutorial

Good content themes:

- Why Web Audio feels awkward in React
- How browser autoplay affects `AudioContext`
- How to build a tone generator
- How to build a frequency sweep
- How to draw analyser data
- How to test React audio controls without playing sound
- Why browser audio prototypes are not medical software

## Good First Issues

Open small issues that external contributors can actually complete:

- Add a StackBlitz example for the Vite demo.
- Add a Next.js App Router example page.
- Add a waveform visualizer recipe.
- Add a fair comparison table to docs.
- Add a metronome demo.
- Add a package-size badge to README.
- Add a troubleshooting entry for Safari audio resume behavior.

## Metrics

Track weekly:

- GitHub stars
- GitHub clones
- GitHub traffic referrers
- npm weekly downloads
- docs/site visits
- demo interactions if analytics are enabled
- external issues opened by people outside the maintainer account
- external PRs

Reasonable early targets:

- Week 1: first external feedback, 10-50 stars
- Month 1: 50-300 stars if launch posts land well
- Month 1: first external issue or PR
- Month 2: search traffic from React/Web Audio queries

These are not guaranteed. They are directional targets.

## What Codex Can Do

Codex can:

- generate the GitHub social preview image
- add docs and comparison pages
- improve README/package metadata
- create launch post drafts
- create GitHub issues and labels
- add SEO-focused examples
- add StackBlitz/CodeSandbox-ready examples
- verify the site/demo before launch
- prepare patch releases

## What Afaq Must Do

Afaq should personally:

- post to Hacker News
- post to Reddit
- launch on Product Hunt
- post on LinkedIn/X
- reply to comments in his own voice
- avoid asking for upvotes or fake engagement
- decide whether to add privacy-friendly analytics

## Source Notes

- GitHub topics help people find and contribute to repositories:
  <https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics>
- GitHub social preview images improve how repo links render:
  <https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview>
- Hacker News Show HN expects something people can try:
  <https://news.ycombinator.com/showhn.html>
- Hacker News guidelines:
  <https://news.ycombinator.com/newsguidelines.html>
- Reddit spam policy warns against repeated/self-promotional link posting:
  <https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam>
- npm package README guidance:
  <https://docs.npmjs.com/about-package-readme-files/>
- Product Hunt launch guidance:
  <https://www.producthunt.com/launch>
