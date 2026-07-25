import type { SpeechRecognitionEventHandler, SpeechRecognitionSettings } from './SpeechRecognitionTypes';

export interface SpeechRecognitionProvider {
  readonly isSupported: () => boolean;
  readonly start: (settings: SpeechRecognitionSettings, onEvent: SpeechRecognitionEventHandler) => void;
  readonly stop: () => void;
  readonly cancel: () => void;
}
