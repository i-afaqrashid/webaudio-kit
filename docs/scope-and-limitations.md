# Scope and Limitations

`webaudio-kit` focuses on safe procedural UI audio for browser and React apps.
It is meant to make short generated sounds, analyser-driven visual feedback,
volume controls, and simple pitch helpers boring to wire up.

The package is intentionally smaller than a full audio engine. It gives apps a
clean path for common UI sounds, then leaves advanced sound design and custom
graphs to raw Web Audio or a dedicated library.

## What webaudio-kit is for

Use `webaudio-kit` when an app needs:

- Button-driven tones, frequency sweeps, and short noise bursts.
- Alert cues, confirmation sounds, test tones, or lightweight audio prototypes.
- React hooks that create and resume `AudioContext` lazily after a user action.
- Shared provider routing through `masterGain -> analyser -> destination`.
- Waveform and spectrum canvases that prove audio is flowing.
- Safe defaults such as low initial gain and clamped frequency helpers.

These are the core product boundaries: safe generated browser sounds, React
ergonomics, and enough Web Audio escape hatches for normal application work.

## What webaudio-kit is not

`webaudio-kit` is not trying to be:

- A DAW, sampler, sequencer, or full synthesizer graph.
- A Tone.js competitor for transport, instruments, effects chains, or musical
  composition.
- A general DSP toolkit with custom AudioWorklets.
- A medical, audiology, hearing-diagnosis, or calibrated testing system.
- A replacement for raw Web Audio when your app needs deep routing control.

If the product is a music workstation, browser synth, multiplayer rhythm game,
or advanced audio lab, start with a full audio engine and use `webaudio-kit`
only for the narrow UI pieces that fit.

## When the hooks are enough

Use `@webaudio-kit/react` hooks first when playback belongs to React UI state.
This is the right default for most product screens.

Hooks are enough when the app needs:

- Stable `play`, `stop`, and `isPlaying` controls.
- Tone, sweep, noise, volume, analyser, or audio-test-mode behavior.
- Provider-scoped `stopAll()` for alert acknowledge actions or route changes.
- Visualizers that react to the same provider graph.
- Safe volume controls through `useVolume()` or `useVolumeControl()`.

Start here for dashboards, admin tools, product onboarding checks, interactive
forms, alert consoles, and demo panels.

## When core primitives are enough

Use `@webaudio-kit/core` when React is not involved or when a small custom graph
already owns the `AudioContext`.

Core is enough when the app needs:

- `playTone()`, `playFrequencySweep()`, or `playNoise()` without React.
- Math helpers such as `dbToGain()`, `gainToDb()`, `clampFrequency()`, and
  MIDI/frequency conversion.
- A custom destination node supplied by your own audio graph.
- Direct handle ownership for one-off playback and cleanup.

In React apps that need both layers, prefer `useAudioEngine()` or
`useAudioContext().ensureAudioContext()` instead of scattered null checks. Those
helpers keep core playback routed through the provider when that is what the UI
expects.

## When to use raw Web Audio

Use raw Web Audio directly when the app needs graph ownership beyond the
provider model:

- Complex routing, buses, sends, sidechains, or a routing matrix.
- Long-lived node graphs that do not map to one play call.
- Custom scheduling rules that should outlive a React component.
- Direct control of every `AudioNode`, connection, and automation curve.
- Integration with existing audio infrastructure in a larger app.

`webaudio-kit` does not hide raw Web Audio from you. It is a small layer for
common generated sounds, and it remains reasonable to mix in raw Web Audio when
the graph becomes your product.

## When to use Tone.js or a full audio engine

Use Tone.js or another full audio engine when the product needs musical or
instrument-grade features:

- Transport, tempo, measures, synced loops, or pattern sequencing.
- Instruments, samplers, effects chains, modulation matrices, or synth presets.
- Polyphonic note management and musical scheduling.
- Audio file playback, recording, granular playback, or advanced effects.
- A mature ecosystem of examples and production music abstractions.

`webaudio-kit` can still sit beside those tools for small UI cues, but it should
not be the foundation for a full music engine.

## Current limitations

Current limits are deliberate until the project proves each layer with real app
usage:

- No full synthesizer graph or instrument preset system.
- No AudioWorklets or custom DSP packaging.
- No microphone input or recording pipeline.
- No advanced routing matrix, buses, or send effects.
- Limited modulation compared with dedicated audio engines.
- A young ecosystem with fewer external examples than older packages.

The package does include practical sound-shaping pieces such as envelopes, patterns, filters, and richer recipes, but those stay focused on short UI cues.
They are not intended to turn the package into a general-purpose synth engine.

## Decision checklist

- Use React hooks for normal product UI audio.
- Use the core package for non-React code or a custom destination node.
- Use raw Web Audio when your app owns the graph and scheduling model.
- Use Tone.js or a full engine when the product is musical, instrument-grade, or
  effect-heavy.

Related docs:

- [Hooks vs Core](./hooks-vs-core.md)
- [API reference](./api.md)
- [Recipes](./recipes.md)
- [Browser audio guide](./browser-audio.md)
- [Safety](./safety.md)
