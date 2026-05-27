// Server-safe entry. No "use client" directive, so importing from
// @webaudio-kit/react/server inside a React Server Component does not
// drag the entire client module (with AudioContext-touching hooks) into
// the client bundle.
//
// Only the framework-agnostic math helpers and value types from
// @webaudio-kit/core are re-exported here. For audio playback and React
// hooks use the default @webaudio-kit/react entry from a client
// component.

export type {
  FrequencySweepOptions,
  NoiseOptions,
  NoiseType,
  NoteNameOptions,
  PlaybackEnvelope,
  PlaybackFilter,
  PlaybackHandle,
  PlaybackPattern,
  PlaybackSafetyOptions,
  PlaybackVoices,
  ToneOptions,
} from "@webaudio-kit/core";
export {
  clampFrequency,
  dbToGain,
  DEFAULT_CONCERT_A,
  DEFAULT_GAIN,
  DEFAULT_MAX_FREQUENCY,
  DEFAULT_MIN_FREQUENCY,
  frequencyToMidi,
  frequencyToNoteName,
  gainToDb,
  midiToFrequency,
} from "@webaudio-kit/core";
