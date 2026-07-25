export type SpeechRecognitionState = 'idle' | 'starting' | 'listening' | 'stopping' | 'cancelled' | 'error' | 'unsupported';

export interface SpeechRecognitionSettings {
  readonly language: string;
  readonly continuous: boolean;
  readonly interimResults: boolean;
  readonly silenceTimeoutMs: number;
  readonly autoRestart: boolean;
}

export interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

export interface SpeechRecognitionResult {
  readonly transcript: string;
  readonly confidence: number;
  readonly isFinal: boolean;
  readonly alternatives: readonly SpeechRecognitionAlternative[];
}

export type SpeechRecognitionErrorCode = 'unsupported' | 'permissionDenied' | 'timeout' | 'cancelled' | 'providerUnavailable' | 'network' | 'unknown';

export interface SpeechRecognitionError {
  readonly code: SpeechRecognitionErrorCode;
  readonly message: string;
}

export type SpeechRecognitionEvent =
  | { readonly type: 'RecognitionStarted'; readonly timestamp: number }
  | { readonly type: 'RecognitionStopped'; readonly timestamp: number }
  | { readonly type: 'RecognitionCancelled'; readonly timestamp: number }
  | { readonly type: 'PartialResult'; readonly timestamp: number; readonly result: SpeechRecognitionResult }
  | { readonly type: 'FinalResult'; readonly timestamp: number; readonly result: SpeechRecognitionResult }
  | { readonly type: 'SilenceDetected'; readonly timestamp: number }
  | { readonly type: 'RecognitionError'; readonly timestamp: number; readonly error: SpeechRecognitionError };

export type SpeechRecognitionEventHandler = (event: SpeechRecognitionEvent) => void;
