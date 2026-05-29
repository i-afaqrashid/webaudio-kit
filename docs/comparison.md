# Comparison

There are a few well-established ways to do audio on the web. They solve
different problems, so the right choice depends on what you are building. This
page lays out where webaudio-kit fits next to Tone.js, Howler.js, and use-sound.

## The short version

- **webaudio-kit** — generate audio (tones, sweeps, noise) and visualize it,
  with no audio files. React hooks plus a framework-agnostic core.
- **Tone.js** — a full framework for making music in the browser: synths,
  effects, transport, and scheduling.
- **Howler.js** — play back audio files and sprites across browsers.
- **use-sound** — a small React hook for playing audio files, built on Howler.

## When to reach for each

| You want to…                                          | Best fit              |
| ----------------------------------------------------- | --------------------- |
| Play a generated beep, chime, or alert with no assets | webaudio-kit          |
| Sweep a frequency or emit shaped noise                | webaudio-kit          |
| Draw a waveform or spectrum of live audio             | webaudio-kit          |
| Play a recorded sound effect or music file            | Howler.js / use-sound |
| Play short sound files from inside React              | use-sound             |
| Build an instrument, sequencer, or DAW-style app      | Tone.js               |

## webaudio-kit

webaudio-kit is built around generating and analyzing audio rather than playing
files. You get React hooks for tones, frequency sweeps, and noise bursts, plus
canvases that wire themselves to an analyser to draw waveforms and spectrums.
Under the hood there is a framework-agnostic core with the math helpers
(`midiToFrequency`, `noteToFrequency`, `decibelsToGain`) so the same primitives
work outside React.

Because the sound is synthesized, there are no audio assets to ship and nothing
to fetch at runtime — useful for UI feedback sounds, test tones, and
visualizers. webaudio-kit deliberately does not try to be a music framework or a
file-playback library; see [Scope and limitations](./scope-and-limitations.md).

## Tone.js

[Tone.js](https://tonejs.github.io/) is a framework for creating music in the
browser. It provides synthesizers, effects, a transport with sample-accurate
scheduling, and a large instrument and signal vocabulary. If you are building an
instrument, a sequencer, or anything that needs musical timing, Tone.js gives
you far more than webaudio-kit aims to. The trade-off is a larger surface area
and more concepts to learn for cases where you only need a tone or a meter.

## Howler.js

[Howler.js](https://howlerjs.com/) is a mature, framework-agnostic library for
playing back audio files. It handles cross-browser quirks, audio sprites, and
spatial audio. Reach for Howler when your sounds are recorded assets — sound
effects, voiceover, music tracks. webaudio-kit does not play files; it generates
sound, so the two cover different needs.

## use-sound

[use-sound](https://github.com/joshwcomeau/use-sound) is a React hook by Josh
Comeau that wraps Howler to play audio files with a minimal API. It is a great
fit when you have sound files and want to trigger them from React. If instead
you want the sound generated for you — a beep without an asset, a sweep, or a
visualization — that is what webaudio-kit is for. The two can coexist in the
same app.

## Can I use them together?

Yes. They are not mutually exclusive. A common setup is use-sound or Howler for
recorded effects and webaudio-kit for generated cues and visualizations. Pick
per sound, not per project.
