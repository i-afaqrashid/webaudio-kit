# Safety

## Default Volume

The default gain is `0.2`. This is intentionally quiet for first-run playback,
but it is not a guarantee of safe loudness.

Real loudness depends on:

- system volume
- headphones or speakers
- device output
- browser gain
- oscillator frequency
- user sensitivity

## Manual Testing

Before testing sound:

- lower system volume
- avoid starting with headphones at high volume
- test stop controls before long listening sessions
- keep high frequencies brief
- avoid surprise autoplay

## Frequency Range

`clampFrequency()` defaults to `20..20000` Hz. This is a broad browser-playable
range, not a health recommendation.

High frequencies can be uncomfortable. Sweeps should start at low gain.

## Disclaimers

Use this language in demos with hearing-test-style UX:

```txt
This library is for browser audio interfaces and prototypes. It is not a
certified audiology or medical testing system.
```

Avoid:

- medical test
- hearing diagnosis
- clinical screening
- calibrated audiometer
- treatment recommendation

## Product Boundaries

`webaudio-kit` does not provide:

- microphone calibration
- hardware calibration
- clinical accuracy
- audiology workflows
- medical device compliance
- hearing threshold validation

It provides browser audio primitives for apps and prototypes.
