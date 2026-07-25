import type { SpeechOutput } from './SpeechOutput';

export interface VoicePlaybackProvider {
  readonly speak: (output: SpeechOutput, signal: AbortSignal) => Promise<void>;
  readonly pause: () => void;
  readonly resume: () => void;
  readonly stop: () => void;
}

export class NullVoicePlaybackProvider implements VoicePlaybackProvider {
  speak(output: SpeechOutput, signal: AbortSignal): Promise<void> {
    void output;
    void signal;
    return Promise.resolve();
  }

  pause(): void { return undefined; }
  resume(): void { return undefined; }
  stop(): void { return undefined; }
}
