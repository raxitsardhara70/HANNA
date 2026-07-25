import type { PlaybackState } from './PlaybackState';
import { SpeechQueue } from './SpeechQueue';
import type { SpeechOutput } from './SpeechOutput';
import { NullVoicePlaybackProvider, type VoicePlaybackProvider } from './VoicePlayback';

export interface SpeechManagerSnapshot {
  readonly state: PlaybackState;
  readonly activeOutputId: string | null;
  readonly queueSize: number;
  readonly muted: boolean;
  readonly error: string | null;
}

export class SpeechManager {
  private readonly queue = new SpeechQueue();
  private abortController: AbortController | null = null;
  private snapshot: SpeechManagerSnapshot = { activeOutputId: null, error: null, muted: false, queueSize: 0, state: 'idle' };

  constructor(private readonly provider: VoicePlaybackProvider = new NullVoicePlaybackProvider()) {}

  getSnapshot(): SpeechManagerSnapshot { return this.snapshot; }

  enqueue(output: SpeechOutput): void {
    this.queue.enqueue(output);
    this.snapshot = { ...this.snapshot, queueSize: this.queue.size(), state: this.snapshot.state === 'idle' ? 'queued' : this.snapshot.state };
    void this.drain();
  }

  interruptSpeaking(): void { this.stopSpeaking(); }

  stopSpeaking(): void {
    this.abortController?.abort();
    this.provider.stop();
    this.queue.clear();
    this.snapshot = { ...this.snapshot, activeOutputId: null, queueSize: 0, state: this.snapshot.muted ? 'muted' : 'idle' };
  }

  mute(): void {
    this.snapshot = { ...this.snapshot, muted: true, state: 'muted' };
    this.provider.pause();
  }

  resume(): void {
    this.snapshot = { ...this.snapshot, muted: false, state: this.snapshot.activeOutputId === null ? 'idle' : 'speaking' };
    this.provider.resume();
  }

  private async drain(): Promise<void> {
    if (this.snapshot.state === 'speaking' || this.snapshot.muted) return;
    const output = this.queue.dequeue();
    if (output === null) {
      this.snapshot = { ...this.snapshot, activeOutputId: null, queueSize: 0, state: 'idle' };
      return;
    }
    this.abortController = new AbortController();
    this.snapshot = { ...this.snapshot, activeOutputId: output.id, error: null, queueSize: this.queue.size(), state: 'speaking' };
    try {
      await this.provider.speak(output, this.abortController.signal);
      this.snapshot = { ...this.snapshot, activeOutputId: null, state: 'idle' };
      await this.drain();
    } catch (error) {
      if (!this.abortController.signal.aborted) {
        this.snapshot = { ...this.snapshot, error: error instanceof Error ? error.message : 'Speech playback failed.', state: 'error' };
      }
    } finally {
      this.abortController = null;
    }
  }
}
