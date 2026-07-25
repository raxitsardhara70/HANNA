export class AudioLevelAnalyzer {
  private readonly audioContext: AudioContext;
  private readonly analyser: AnalyserNode;
  private readonly gain: GainNode;
  private readonly source: MediaStreamAudioSourceNode;
  private readonly data: Uint8Array<ArrayBuffer>;
  private frameId: number | null = null;

  constructor(stream: MediaStream, gainValue: number) {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.gain = this.audioContext.createGain();
    this.source = this.audioContext.createMediaStreamSource(stream);
    this.data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.fftSize = 256;
    this.gain.gain.value = gainValue;
    this.source.connect(this.gain);
    this.gain.connect(this.analyser);
  }

  setGain(value: number): void {
    this.gain.gain.value = value;
  }

  start(onLevel: (level: number) => void): void {
    const tick = (): void => {
      this.analyser.getByteTimeDomainData(this.data);
      const sum = this.data.reduce((total, sample) => {
        const normalized = (sample - 128) / 128;
        return total + normalized * normalized;
      }, 0);
      onLevel(Math.min(1, Math.sqrt(sum / this.data.length) * 4));
      this.frameId = window.requestAnimationFrame(tick);
    };
    tick();
  }

  async dispose(): Promise<void> {
    if (this.frameId !== null) window.cancelAnimationFrame(this.frameId);
    this.source.disconnect();
    this.gain.disconnect();
    this.analyser.disconnect();
    await this.audioContext.close();
  }
}
