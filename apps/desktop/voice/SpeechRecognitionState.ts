import type { SpeechRecognitionSettings, SpeechRecognitionState } from './SpeechRecognitionTypes';

export const defaultSpeechRecognitionSettings: SpeechRecognitionSettings = {
  autoRestart: true,
  continuous: false,
  interimResults: true,
  language: 'en-US',
  silenceTimeoutMs: 1_500,
};

export interface SpeechRecognitionSnapshot {
  readonly state: SpeechRecognitionState;
  readonly settings: SpeechRecognitionSettings;
  readonly partialTranscript: string;
  readonly finalTranscript: string;
  readonly confidence: number;
  readonly error: string | null;
}

export const createInitialSpeechRecognitionSnapshot = (settings: SpeechRecognitionSettings): SpeechRecognitionSnapshot => ({
  confidence: 0,
  error: null,
  finalTranscript: '',
  partialTranscript: '',
  settings,
  state: 'idle',
});
