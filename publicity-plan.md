# webaudio-kit Publicity Plan

Source notes: `../2.md`

## Positioning

Do not market it as:

> React hooks for Web Audio API.

That is accurate, but not strong enough.

Market it as:

> Build serious browser audio interfaces in React without fighting AudioContext.

Good titles:

- I built React hooks for tone generation, frequency sweeps, and audio visualization
- webaudio-kit: React primitives for browser audio tools
- Building a hearing-test-style audio UI with React and the Web Audio API

## Repo Readiness Checklist

- One-line pitch
- GIF or video demo
- Install command
- 30-second example
- Real output screenshot
- "Why this exists"
- Roadmap
- Good first issues
- License
- Contributing guide

Suggested GitHub topics:

- `react`
- `typescript`
- `web-audio`
- `audio`
- `webaudio`
- `hooks`
- `music`
- `visualizer`
- `browser-api`
- `frontend`

## Best Audiences

- r/reactjs
- r/javascript
- r/webdev
- Hacker News Show HN
- Dev.to
- Hashnode
- CodePen
- StackBlitz
- YouTube Shorts / Loom demos
- Music tech communities
- Creative coding communities
- Web Audio Discords/forums

This repo needs demos more than articles.

## Demo Site

Build a docs site with live demos:

- `/tone-generator`
- `/frequency-sweep`
- `/hearing-test-prototype`
- `/waveform-visualizer`
- `/metronome`

Each post should be visual.

## Example Launch Post

```txt
Show HN: webaudio-kit - React hooks for browser audio tools
```

Example body:

```txt
I built a small React + TypeScript library around the Web Audio API.

The first version has:
- AudioProvider
- useTone()
- useFrequencySweep()
- useAnalyser()
- basic waveform demo

I originally worked on browser audio for a hearing-test-style app and wanted cleaner primitives for future projects.

Demo: ...
Repo: ...
```

## Content Ideas

- Why Web Audio feels weird in React.
- Building a tone generator with useTone().
- Frequency sweeps in the browser.
- How to visualize audio with AnalyserNode.
- What not to do when managing AudioContext in React.
- Building a hearing-test-style UI in the browser.
- Why this is not medical software.

The last one matters. Be responsible.

## Demo Video

The demo should show:

1. Install package
2. Write `useTone()`
3. Click button
4. Tone plays
5. Switch frequency
6. Waveform moves

## Launch Timing

Do this after cms-lab has a working first version and launch foundation.

Use Hacker News, Reddit, dev communities, and demo-heavy posts first. Product Hunt is later and less important for this technical audience.

## Feature Content Loop

For each feature, create:

- Code
- Demo
- Short post
- Longer tutorial

Example:

- Feature: `useFrequencySweep()`
- Demo: sweep from 250Hz to 8000Hz
- Short post: "Built frequency sweeps in React"
- Tutorial: "How to create a browser frequency sweep with Web Audio"

