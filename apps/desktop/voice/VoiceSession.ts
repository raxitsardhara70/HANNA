import { AudioLevelAnalyzer } from './AudioLevelAnalyzer';
import type { VoiceSettings } from './VoiceTypes';

export class VoiceSession {
  private analyzer: AudioLevelAnalyzer | null = null;
  private disposed = false;
  private paused = false;

  constructor(readonly id: string, private readonly stream: MediaStream, private settings: VoiceSettings) {}

  start(onLevel: (level: number) => void, onEnded: () => void): Promise<void> {
    if (this.disposed) throw new Error('Cannot start disposed voice session.');
    this.stream.getAudioTracks().forEach((track) => {
      track.onended = onEnded;
    });
    this.analyzer = new AudioLevelAnalyzer(this.stream, this.settings.inputGain);
    this.analyzer.start((level) => {
      if (!this.paused) onLevel(level);
    });
    return Promise.resolve();
  }

  pause(): void { this.paused = true; }
  resume(): void { this.paused = false; }
  stop(): void { this.dispose(); }
  cancel(): void { this.dispose(); }

  setSettings(settings: VoiceSettings): void {
    this.settings = settings;
    this.analyzer?.setGain(settings.inputGain);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    void this.analyzer?.dispose();
    this.analyzer = null;
    this.stream.getTracks().forEach((track) => { track.stop(); });
  }
}
