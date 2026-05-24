export class BenchmarkAudioParam {
  eventCount = 0;
  value: number;

  constructor(value: number) {
    this.value = value;
  }

  cancelScheduledValues() {
    this.eventCount += 1;
    return this;
  }

  linearRampToValueAtTime(value: number) {
    this.value = value;
    this.eventCount += 1;
    return this;
  }

  setValueAtTime(value: number) {
    this.value = value;
    this.eventCount += 1;
    return this;
  }
}

export class BenchmarkAudioNode {
  connectionCount = 0;
  disconnectCount = 0;

  connect(destination: unknown) {
    this.connectionCount += 1;
    return destination;
  }

  disconnect() {
    this.disconnectCount += 1;
  }
}

export class BenchmarkOscillatorNode extends BenchmarkAudioNode {
  frequency = new BenchmarkAudioParam(440);
  onended: (() => void) | null = null;
  startCount = 0;
  stopCount = 0;
  type: OscillatorType = "sine";

  start() {
    this.startCount += 1;
  }

  stop() {
    this.stopCount += 1;
    this.onended?.();
  }
}

export class BenchmarkGainNode extends BenchmarkAudioNode {
  gain = new BenchmarkAudioParam(1);
}

export class BenchmarkStereoPannerNode extends BenchmarkAudioNode {
  pan = new BenchmarkAudioParam(0);
}

export class BenchmarkAnalyserNode extends BenchmarkAudioNode {
  fftSize = 2048;
  private phase = 0;

  getByteTimeDomainData(data: Uint8Array) {
    for (let index = 0; index < data.length; index += 1) {
      data[index] = 128 + Math.round(Math.sin((index + this.phase) / 16) * 64);
    }

    this.phase += 1;
  }
}

export class BenchmarkAudioContext {
  currentTime = 0;
  destination = new BenchmarkAudioNode();
  state: AudioContextState = "suspended";
  analysers = 0;
  gains = 0;
  oscillators = 0;
  panners = 0;

  async close() {
    this.state = "closed";
  }

  createAnalyser() {
    this.analysers += 1;
    return new BenchmarkAnalyserNode();
  }

  createGain() {
    this.gains += 1;
    return new BenchmarkGainNode();
  }

  createOscillator() {
    this.oscillators += 1;
    return new BenchmarkOscillatorNode();
  }

  createStereoPanner() {
    this.panners += 1;
    return new BenchmarkStereoPannerNode();
  }

  async resume() {
    this.state = "running";
  }
}

export function createBenchmarkAudioContext(): AudioContext {
  return new BenchmarkAudioContext() as unknown as AudioContext;
}

export function installBenchmarkAudioContext(): () => void {
  const descriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "AudioContext",
  );

  Object.defineProperty(globalThis, "AudioContext", {
    configurable: true,
    value: BenchmarkAudioContext,
    writable: true,
  });

  return () => {
    if (descriptor) {
      Object.defineProperty(globalThis, "AudioContext", descriptor);
      return;
    }

    Reflect.deleteProperty(globalThis, "AudioContext");
  };
}
