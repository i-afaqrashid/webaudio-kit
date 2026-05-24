# Examples

## Tone Generator

```tsx
function ToneGenerator() {
  const [frequency, setFrequency] = useState(440);
  const tone = useTone({ frequency, gain: 0.2, type: "sine" });

  return (
    <>
      <input
        min="20"
        max="20000"
        onChange={(event) => setFrequency(Number(event.target.value))}
        type="range"
        value={frequency}
      />
      <button onClick={() => void tone.play()}>Play</button>
      <button onClick={tone.stop}>Stop</button>
    </>
  );
}
```

## Frequency Sweep

```tsx
function SweepDemo() {
  const sweep = useFrequencySweep({
    from: 250,
    to: 8000,
    durationMs: 2400,
    gain: 0.1,
  });

  return (
    <>
      <button onClick={() => void sweep.play()}>Run sweep</button>
      <button onClick={sweep.stop}>Stop</button>
    </>
  );
}
```

## Volume Control

```tsx
function VolumeControl() {
  const volume = useVolume();

  return (
    <label>
      Volume
      <input
        max="1"
        min="0"
        onChange={(event) => void volume.setGain(Number(event.target.value))}
        step="0.01"
        type="range"
        value={volume.gain}
      />
    </label>
  );
}
```

## Waveform Analyser

```tsx
function WaveformCanvas() {
  const analyser = useAnalyser();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const data = new Uint8Array(analyser.fftSize);
    let frame = 0;

    const draw = () => {
      frame = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(data);
      context.clearRect(0, 0, canvas.width, canvas.height);
    };

    draw();
    return () => cancelAnimationFrame(frame);
  }, [analyser]);

  return <canvas ref={canvasRef} width="720" height="180" />;
}
```

## Metronome Prototype

```tsx
function Metronome() {
  const click = useTone({
    frequency: 1200,
    gain: 0.15,
    type: "square",
    durationMs: 40,
  });

  return <button onClick={() => void click.play()}>Click</button>;
}
```

For a real metronome, schedule future clicks with Web Audio time instead of
React timers alone.

## Hearing-Test-Style Prototype

```tsx
function HearingStylePrototype() {
  const tone = useTone({
    frequency: 1000,
    gain: 0.05,
    pan: 0,
    durationMs: 800,
  });

  return (
    <>
      <button onClick={() => void tone.play()}>Play tone</button>
      <button onClick={tone.stop}>Stop</button>
      <p>
        Prototype only. This is not certified audiology or medical testing
        software.
      </p>
    </>
  );
}
```

Do not describe a browser prototype as a hearing test, diagnosis, screening, or
calibrated audiology tool unless it has gone through the required clinical,
regulatory, and hardware calibration process outside this library.
