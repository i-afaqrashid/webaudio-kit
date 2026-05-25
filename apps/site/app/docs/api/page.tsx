import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock, PageShell, SectionHeader } from "../../components";

export const metadata: Metadata = {
  title: "API Reference",
  description:
    "Public API reference for webaudio-kit React hooks, visualizer components, audio test mode, and core Web Audio helpers.",
};

type ApiRow = {
  name: string;
  type: string;
  defaultValue?: string;
  notes: string;
};

type DemoHref =
  | "/demos/noise"
  | "/demos/sweep"
  | "/demos/test-mode"
  | "/demos/tone";

type ApiSection = {
  id: string;
  title: string;
  packageName: "@webaudio-kit/react" | "@webaudio-kit/core";
  summary: string;
  signature: string;
  rows: ApiRow[];
  returns?: ApiRow[];
  example: {
    title: string;
    code: string;
  };
  demo?: {
    href: DemoHref;
    label: string;
  };
};

const reactSections: ApiSection[] = [
  {
    id: "audio-provider",
    title: "AudioProvider",
    packageName: "@webaudio-kit/react",
    summary:
      "Wraps React UI that needs playback. It creates AudioContext lazily, routes playback through masterGain -> analyser -> destination, and starts with a safe master gain.",
    signature: `function AudioProvider(props: AudioProviderProps): JSX.Element;

type AudioProviderProps = {
  children: ReactNode;
  initialGain?: number;
};`,
    rows: [
      {
        name: "AudioProviderProps.children",
        type: "ReactNode",
        notes: "Required React subtree that can call webaudio-kit hooks.",
      },
      {
        name: "AudioProviderProps.initialGain",
        type: "number",
        defaultValue: "0.2",
        notes:
          "Initial master gain. Non-finite values fall back to the package default and negative values clamp to 0.",
      },
    ],
    returns: [
      {
        name: "audioContext",
        type: "AudioContext | null",
        notes: "Null until the first user-initiated playback creates audio.",
      },
      {
        name: "masterGain",
        type: "GainNode | null",
        notes: "Shared gain node for all playback created by provider hooks.",
      },
      {
        name: "analyser",
        type: "AnalyserNode | null",
        notes: "Shared analyser node for waveform and spectrum UI.",
      },
      {
        name: "state",
        type: 'AudioContextState | "idle"',
        notes:
          "Idle before creation, then mirrors the current AudioContext state.",
      },
    ],
    example: {
      title: "Provider shell",
      code: `import { AudioProvider } from "@webaudio-kit/react";

export function App() {
  return (
    <AudioProvider initialGain={0.2}>
      <AudioControls />
    </AudioProvider>
  );
}`,
    },
  },
  {
    id: "use-audio-context",
    title: "useAudioContext",
    packageName: "@webaudio-kit/react",
    summary:
      "Reads the provider runtime state and low-level controls. Use this when you need context state, analyser access, or custom UI around provider gain.",
    signature: `function useAudioContext(): AudioProviderValue;

type AudioProviderValue = {
  audioContext: AudioContext | null;
  masterGain: GainNode | null;
  analyser: AnalyserNode | null;
  state: AudioContextState | "idle";
  gain: number;
  ensureAudioContext(): Promise<AudioRuntime>;
  setGain(gain: number): Promise<void>;
};`,
    rows: [
      {
        name: "state",
        type: 'AudioContextState | "idle"',
        notes:
          "Display whether audio is idle, running, suspended, closed, or interrupted by the browser.",
      },
      {
        name: "ensureAudioContext()",
        type: "Promise<AudioRuntime>",
        notes:
          "Creates and resumes AudioContext on demand. Call it only from user-initiated handlers or higher-level hooks.",
      },
      {
        name: "setGain(gain)",
        type: "Promise<void>",
        notes:
          "Updates provider master gain and clamps invalid input to safe values.",
      },
    ],
    example: {
      title: "Context state badge",
      code: `import { useAudioContext } from "@webaudio-kit/react";

function AudioStateBadge() {
  const audio = useAudioContext();

  return <span>{audio.state}</span>;
}`,
    },
  },
  {
    id: "use-tone",
    title: "useTone",
    packageName: "@webaudio-kit/react",
    summary:
      "Creates stable controls for one oscillator tone. Every play call creates fresh oscillator, gain, and pan nodes and cleans them up when playback ends.",
    signature: `function useTone(options: ToneOptions): {
  play(overrides?: Partial<ToneOptions>): Promise<void>;
  stop(): void;
  isPlaying: boolean;
};`,
    rows: [
      {
        name: "ToneOptions.frequency",
        type: "number",
        notes:
          "Tone frequency in Hz. Values are clamped by core playback to 20..20000 by default.",
      },
      {
        name: "ToneOptions.gain",
        type: "number",
        defaultValue: "0.2",
        notes: "Per-play gain before the provider master gain.",
      },
      {
        name: "ToneOptions.type",
        type: "OscillatorType",
        defaultValue: '"sine"',
        notes:
          'Any browser oscillator type: "sine", "square", "sawtooth", or "triangle".',
      },
      {
        name: "ToneOptions.pan",
        type: "number",
        defaultValue: "0",
        notes:
          "Stereo pan from -1 left to 1 right when StereoPannerNode is available.",
      },
      {
        name: "ToneOptions.durationMs",
        type: "number",
        notes: "Optional duration. Omit it for manual stop control.",
      },
    ],
    returns: [
      {
        name: "play(overrides)",
        type: "Promise<void>",
        notes:
          "Resumes provider audio, stops any previous tone from this hook, then starts the next tone.",
      },
      {
        name: "stop()",
        type: "void",
        notes: "Stops and disconnects the current tone for this hook.",
      },
      {
        name: "isPlaying",
        type: "boolean",
        notes:
          "True after play starts and false after stop or scheduled duration completion.",
      },
    ],
    example: {
      title: "Tone button",
      code: `import { useTone } from "@webaudio-kit/react";

function ToneButton() {
  const tone = useTone({
    frequency: 440,
    gain: 0.15,
    type: "sine",
  });

  return (
    <>
      <button onClick={() => void tone.play({ durationMs: 600 })}>
        Play tone
      </button>
      <button onClick={tone.stop}>Stop</button>
    </>
  );
}`,
    },
    demo: { href: "/demos/tone", label: "Open tone demo" },
  },
  {
    id: "use-frequency-sweep",
    title: "useFrequencySweep",
    packageName: "@webaudio-kit/react",
    summary:
      "Creates stable controls for a scheduled oscillator ramp between two clamped frequencies.",
    signature: `function useFrequencySweep(options: FrequencySweepOptions): {
  play(overrides?: Partial<FrequencySweepOptions>): Promise<void>;
  stop(): void;
  isPlaying: boolean;
};`,
    rows: [
      {
        name: "FrequencySweepOptions.from",
        type: "number",
        notes:
          "Start frequency in Hz. Core playback clamps it to the playable range.",
      },
      {
        name: "FrequencySweepOptions.to",
        type: "number",
        notes:
          "End frequency in Hz. Core playback clamps it to the playable range.",
      },
      {
        name: "FrequencySweepOptions.durationMs",
        type: "number",
        notes:
          "Required positive sweep duration. Invalid values throw before scheduling.",
      },
      {
        name: "FrequencySweepOptions.gain",
        type: "number",
        defaultValue: "0.2",
        notes: "Per-sweep gain before the provider master gain.",
      },
      {
        name: "FrequencySweepOptions.type",
        type: "OscillatorType",
        defaultValue: '"sine"',
        notes: "Oscillator waveform used throughout the sweep.",
      },
      {
        name: "FrequencySweepOptions.pan",
        type: "number",
        defaultValue: "0",
        notes:
          "Stereo pan from -1 left to 1 right when supported by the browser.",
      },
    ],
    returns: [
      {
        name: "play(overrides)",
        type: "Promise<void>",
        notes: "Resumes provider audio and schedules a linear frequency ramp.",
      },
      {
        name: "stop()",
        type: "void",
        notes: "Stops and disconnects the active sweep.",
      },
      {
        name: "isPlaying",
        type: "boolean",
        notes: "True while the scheduled sweep is active.",
      },
    ],
    example: {
      title: "Sweep button",
      code: `import { useFrequencySweep } from "@webaudio-kit/react";

function SweepButton() {
  const sweep = useFrequencySweep({
    from: 250,
    to: 8000,
    durationMs: 2400,
    gain: 0.12,
  });

  return <button onClick={() => void sweep.play()}>Run sweep</button>;
}`,
    },
    demo: { href: "/demos/sweep", label: "Open sweep demo" },
  },
  {
    id: "use-noise",
    title: "useNoise",
    packageName: "@webaudio-kit/react",
    summary:
      "Creates stable controls for short generated white, pink, or brown noise buffers.",
    signature: `function useNoise(options: NoiseOptions): {
  play(overrides?: Partial<NoiseOptions>): Promise<void>;
  stop(): void;
  isPlaying: boolean;
};`,
    rows: [
      {
        name: "NoiseOptions.durationMs",
        type: "number",
        notes: "Required positive duration for the generated buffer.",
      },
      {
        name: "NoiseOptions.gain",
        type: "number",
        defaultValue: "0.2",
        notes: "Per-burst gain before the provider master gain. Keep this low.",
      },
      {
        name: "NoiseOptions.pan",
        type: "number",
        defaultValue: "0",
        notes:
          "Stereo pan from -1 left to 1 right when supported by the browser.",
      },
      {
        name: "NoiseOptions.type",
        type: '"white" | "pink" | "brown"',
        defaultValue: '"white"',
        notes: "Noise color used when generating the buffer.",
      },
    ],
    returns: [
      {
        name: "play(overrides)",
        type: "Promise<void>",
        notes:
          "Resumes provider audio, generates a fresh buffer, and starts it.",
      },
      {
        name: "stop()",
        type: "void",
        notes: "Stops and disconnects the active noise source.",
      },
      {
        name: "isPlaying",
        type: "boolean",
        notes: "True while the burst is active.",
      },
    ],
    example: {
      title: "Noise burst",
      code: `import { useNoise } from "@webaudio-kit/react";

function NoiseButton() {
  const noise = useNoise({
    type: "pink",
    durationMs: 800,
    gain: 0.08,
  });

  return <button onClick={() => void noise.play()}>Play pink noise</button>;
}`,
    },
    demo: { href: "/demos/noise", label: "Open noise demo" },
  },
  {
    id: "use-volume",
    title: "useVolume",
    packageName: "@webaudio-kit/react",
    summary:
      "Reads and updates the provider master gain. Use this for one shared volume control across tone, sweep, and noise playback.",
    signature: `function useVolume(): {
  gain: number;
  setGain(gain: number): Promise<void>;
};`,
    rows: [
      {
        name: "gain",
        type: "number",
        notes: "Current provider master gain.",
      },
      {
        name: "setGain(gain)",
        type: "Promise<void>",
        notes:
          "Normalizes invalid input and updates masterGain when audio already exists.",
      },
    ],
    example: {
      title: "Master volume",
      code: `import { useVolume } from "@webaudio-kit/react";

function VolumeSlider() {
  const volume = useVolume();

  return (
    <input
      max={0.5}
      min={0}
      onChange={(event) => void volume.setGain(event.currentTarget.valueAsNumber)}
      step={0.01}
      type="range"
      value={volume.gain}
    />
  );
}`,
    },
  },
  {
    id: "use-analyser",
    title: "useAnalyser",
    packageName: "@webaudio-kit/react",
    summary:
      "Returns the provider analyser node so custom visualizers can read time-domain or frequency-domain data.",
    signature: "function useAnalyser(): AnalyserNode | null;",
    rows: [
      {
        name: "return value",
        type: "AnalyserNode | null",
        notes:
          "Null before the provider creates AudioContext. Non-null after playback initializes the graph.",
      },
    ],
    example: {
      title: "Custom analyser read",
      code: `import { useAnalyser } from "@webaudio-kit/react";

function Meter() {
  const analyser = useAnalyser();

  if (!analyser) {
    return <span>Idle</span>;
  }

  return <span>{analyser.fftSize} point analyser</span>;
}`,
    },
  },
  {
    id: "waveform-canvas",
    title: "WaveformCanvas",
    packageName: "@webaudio-kit/react",
    summary:
      "Draws analyser time-domain data into a canvas and renders an idle center line before audio exists.",
    signature: `function WaveformCanvas(props: WaveformCanvasProps): JSX.Element;

type WaveformCanvasProps = Omit<
  CanvasHTMLAttributes<HTMLCanvasElement>,
  "children"
> & {
  backgroundColor?: string;
  idleStrokeColor?: string;
  lineWidth?: number;
  strokeColor?: string;
};`,
    rows: [
      {
        name: "WaveformCanvasProps.strokeColor",
        type: "string",
        defaultValue: '"#c8ea3a"',
        notes: "Stroke color used when analyser data is available.",
      },
      {
        name: "WaveformCanvasProps.idleStrokeColor",
        type: "string",
        notes: "Optional separate stroke color for the idle center line.",
      },
      {
        name: "WaveformCanvasProps.backgroundColor",
        type: "string",
        defaultValue: '"#10110f"',
        notes: "Canvas fill color.",
      },
      {
        name: "WaveformCanvasProps.lineWidth",
        type: "number",
        defaultValue: "2",
        notes: "Canvas stroke width.",
      },
    ],
    example: {
      title: "Waveform",
      code: `import { WaveformCanvas } from "@webaudio-kit/react";

function Signal() {
  return (
    <WaveformCanvas
      aria-label="Waveform analyser"
      height={180}
      strokeColor="#c8ea3a"
      width={720}
    />
  );
}`,
    },
    demo: { href: "/demos/tone", label: "Open tone demo" },
  },
  {
    id: "spectrum-canvas",
    title: "SpectrumCanvas",
    packageName: "@webaudio-kit/react",
    summary:
      "Draws analyser frequency-domain data into compact bars and renders low idle bars before audio exists.",
    signature: `function SpectrumCanvas(props: SpectrumCanvasProps): JSX.Element;

type SpectrumCanvasProps = Omit<
  CanvasHTMLAttributes<HTMLCanvasElement>,
  "children"
> & {
  backgroundColor?: string;
  barColor?: string;
  barCount?: number;
  barGap?: number;
  idleBarColor?: string;
  minBarHeight?: number;
};`,
    rows: [
      {
        name: "SpectrumCanvasProps.barColor",
        type: "string",
        defaultValue: '"#c8ea3a"',
        notes: "Bar color used when analyser data is available.",
      },
      {
        name: "SpectrumCanvasProps.barCount",
        type: "number",
        defaultValue: "48",
        notes: "Number of bars to draw from the analyser bins.",
      },
      {
        name: "SpectrumCanvasProps.barGap",
        type: "number",
        defaultValue: "2",
        notes: "Gap in canvas pixels between bars.",
      },
      {
        name: "SpectrumCanvasProps.minBarHeight",
        type: "number",
        defaultValue: "2",
        notes: "Minimum rendered bar height so idle state stays visible.",
      },
    ],
    example: {
      title: "Spectrum",
      code: `import { SpectrumCanvas } from "@webaudio-kit/react";

function Spectrum() {
  return (
    <SpectrumCanvas
      aria-label="Spectrum analyser"
      barCount={48}
      height={140}
      width={720}
    />
  );
}`,
    },
    demo: { href: "/demos/tone", label: "Open tone demo" },
  },
  {
    id: "use-audio-test-mode",
    title: "useAudioTestMode",
    packageName: "@webaudio-kit/react",
    summary:
      "Runs a short low-gain sequence that checks tone output, stereo pan, sweep scheduling, noise generation, and analyser routing.",
    signature: `function useAudioTestMode(options?: AudioTestModeOptions): AudioTestModeControls;

type AudioTestModeOptions = {
  gapMs?: number;
  steps?: AudioTestModeStep[];
};

type AudioTestModeControls = {
  currentStep: AudioTestModeStep | null;
  currentStepIndex: number;
  isRunning: boolean;
  run(): Promise<void>;
  stop(): void;
  steps: AudioTestModeStep[];
};`,
    rows: [
      {
        name: "AudioTestModeOptions.gapMs",
        type: "number",
        defaultValue: "120",
        notes: "Delay between steps.",
      },
      {
        name: "AudioTestModeOptions.steps",
        type: "AudioTestModeStep[]",
        notes:
          "Custom sequence. Falls back to the package default steps when omitted or empty.",
      },
      {
        name: "AudioTestModeControls.currentStep",
        type: "AudioTestModeStep | null",
        notes: "The active step while the sequence is running.",
      },
      {
        name: "AudioTestModeControls.run()",
        type: "Promise<void>",
        notes: "Starts the full sequence from a user action.",
      },
    ],
    example: {
      title: "Audio test mode",
      code: `import { useAudioTestMode } from "@webaudio-kit/react";

function AudioSelfCheck() {
  const testMode = useAudioTestMode();

  return (
    <>
      <button onClick={() => void testMode.run()}>Run test</button>
      <button onClick={testMode.stop}>Stop</button>
      <span>{testMode.currentStep?.label ?? "Idle"}</span>
    </>
  );
}`,
    },
    demo: { href: "/demos/test-mode", label: "Open test mode demo" },
  },
];

const coreRows: ApiRow[] = [
  {
    name: "dbToGain(db)",
    type: "(db: number) => number",
    notes:
      "Returns 10 ** (db / 20). Use it when UI stores volume in decibels but Web Audio needs gain.",
  },
  {
    name: "gainToDb(gain)",
    type: "(gain: number) => number",
    notes:
      "Returns 20 * log10(gain). Zero, negative, and non-finite values return -Infinity.",
  },
  {
    name: "clampFrequency(value, min, max)",
    type: "(value: number, min?: number, max?: number) => number",
    defaultValue: "20..20000",
    notes:
      "Clamps a frequency into the configured range and normalizes swapped min and max values.",
  },
  {
    name: "midiToFrequency(midiNote, concertA)",
    type: "(midiNote: number, concertA?: number) => number",
    defaultValue: "A4 = 440",
    notes: "Converts a MIDI note number to Hz. Invalid input returns NaN.",
  },
  {
    name: "frequencyToMidi(frequency, concertA)",
    type: "(frequency: number, concertA?: number) => number",
    defaultValue: "A4 = 440",
    notes:
      "Converts Hz to a fractional MIDI note number. Invalid input returns NaN.",
  },
  {
    name: "frequencyToNoteName(frequency, options)",
    type: "(frequency: number, options?: NoteNameOptions) => string",
    notes:
      'Returns labels such as "A4" or "A4 +3c". Invalid input returns "unknown".',
  },
  {
    name: "playTone(context, options, destination)",
    type: "(AudioContext, ToneOptions, AudioNode?) => PlaybackHandle",
    notes:
      "Creates oscillator, gain, optional stereo panner, starts playback, and returns stop cleanup.",
  },
  {
    name: "playFrequencySweep(context, options, destination)",
    type: "(AudioContext, FrequencySweepOptions, AudioNode?) => PlaybackHandle",
    notes:
      "Creates an oscillator and schedules a linear frequency ramp between clamped endpoints.",
  },
  {
    name: "playNoise(context, options, destination)",
    type: "(AudioContext, NoiseOptions, AudioNode?) => PlaybackHandle",
    notes:
      "Generates a white, pink, or brown noise buffer for the requested duration.",
  },
];

export default function ApiDocsPage() {
  return (
    <PageShell active="docs">
      <main className="docPage apiReferencePage">
        <section className="docHero">
          <div className="wrap">
            <span className="kicker">API reference</span>
            <h1>Public API reference.</h1>
            <p>
              Copy-paste signatures, option tables, return values, and examples
              for the React package and browser-safe core helpers.
            </p>
            <div className="heroActions">
              <Link className="button buttonPrimary" href="/docs">
                Back to docs
              </Link>
              <Link className="button" href="/demos">
                Open demos
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap docLayout apiReferenceLayout">
            <aside className="toc" aria-label="API sections">
              <a href="#audio-provider">AudioProvider</a>
              <a href="#use-audio-context">useAudioContext</a>
              <a href="#use-tone">useTone</a>
              <a href="#use-frequency-sweep">useFrequencySweep</a>
              <a href="#use-noise">useNoise</a>
              <a href="#use-volume">useVolume</a>
              <a href="#use-analyser">useAnalyser</a>
              <a href="#waveform-canvas">WaveformCanvas</a>
              <a href="#spectrum-canvas">SpectrumCanvas</a>
              <a href="#use-audio-test-mode">useAudioTestMode</a>
              <a href="#core-helpers">Core helpers</a>
            </aside>

            <article className="docContent apiReferenceContent">
              <SectionHeader
                kicker="Reference"
                title="React package exports."
                copy="These APIs are imported from @webaudio-kit/react. The hooks must run under AudioProvider."
              />

              {reactSections.map((section) => (
                <ApiReferenceSection key={section.id} section={section} />
              ))}

              <section className="apiReferenceSection" id="core-helpers">
                <div className="apiSectionHeader">
                  <span className="apiPackage">@webaudio-kit/core</span>
                  <h2>Core helpers</h2>
                  <p>
                    These exports come from <code>@webaudio-kit/core</code> and
                    are also re-exported by the React package for convenience.
                  </p>
                </div>
                <ApiTable rows={coreRows} />
                <CodeBlock title="Core helper usage">{`import {
  clampFrequency,
  dbToGain,
  frequencyToNoteName,
  gainToDb,
} from "@webaudio-kit/core";

const frequency = clampFrequency(inputFrequency);
const gain = dbToGain(-14);
const db = gainToDb(0.2);
const note = frequencyToNoteName(440, { includeCents: true });`}</CodeBlock>
                <div className="docActionLinks">
                  <Link className="button" href="/docs#helpers">
                    Back to helper overview
                  </Link>
                </div>
              </section>
            </article>
          </div>
        </section>
      </main>
    </PageShell>
  );
}

function ApiReferenceSection({ section }: { section: ApiSection }) {
  return (
    <section className="apiReferenceSection" id={section.id}>
      <div className="apiSectionHeader">
        <span className="apiPackage">{section.packageName}</span>
        <h2>{section.title}</h2>
        <p>{section.summary}</p>
      </div>
      <div className="apiExampleGrid">
        <CodeBlock title="Signature">{section.signature}</CodeBlock>
        <CodeBlock title={section.example.title}>
          {section.example.code}
        </CodeBlock>
      </div>
      <ApiTable rows={section.rows} />
      {section.returns ? (
        <>
          <h3 id={`${section.id}-returns`}>Returns</h3>
          <ApiTable rows={section.returns} />
        </>
      ) : null}
      {section.demo ? (
        <div className="docActionLinks">
          <Link className="button" href={section.demo.href}>
            {section.demo.label}
          </Link>
        </div>
      ) : null}
    </section>
  );
}

function ApiTable({ rows }: { rows: ApiRow[] }) {
  return (
    <div className="apiTableWrap">
      <table className="apiTable">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Type</th>
            <th scope="col">Default</th>
            <th scope="col">Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td data-label="Name">
                <code>{row.name}</code>
              </td>
              <td data-label="Type">{row.type}</td>
              <td data-label="Default">{row.defaultValue ?? "n/a"}</td>
              <td data-label="Notes">{row.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
