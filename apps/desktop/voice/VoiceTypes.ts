export type VoiceState = 'idle' | 'requestingPermission' | 'listening' | 'processing' | 'speaking' | 'muted' | 'disabled' | 'error';

export type VoicePermissionState = 'unknown' | 'prompt' | 'granted' | 'denied' | 'revoked';

export interface VoiceInputDevice {
  readonly deviceId: string;
  readonly label: string;
  readonly groupId: string;
}

export interface VoiceSettings {
  readonly muted: boolean;
  readonly inputDeviceId: string | null;
  readonly inputGain: number;
  readonly noiseSuppression: boolean;
  readonly echoCancellation: boolean;
  readonly autoGainControl: boolean;
  readonly pushToTalk: boolean;
}

export interface VoiceError {
  readonly code: 'permissionDenied' | 'permissionRevoked' | 'microphoneUnavailable' | 'microphoneInUse' | 'sessionAlreadyActive' | 'deviceDisconnected' | 'unknown';
  readonly message: string;
}

export interface VoiceSnapshot {
  readonly state: VoiceState;
  readonly permission: VoicePermissionState;
  readonly settings: VoiceSettings;
  readonly devices: readonly VoiceInputDevice[];
  readonly activeSessionId: string | null;
  readonly audioLevel: number;
  readonly error: VoiceError | null;
}

export interface VoiceContextValue extends VoiceSnapshot {
  readonly refresh: () => Promise<void>;
  readonly requestPermission: () => Promise<void>;
  readonly revokePermission: () => Promise<void>;
  readonly startListening: () => Promise<void>;
  readonly stopListening: () => Promise<void>;
  readonly cancelListening: () => Promise<void>;
  readonly toggleListening: () => Promise<void>;
  readonly mute: () => Promise<void>;
  readonly unmute: () => Promise<void>;
  readonly updateSettings: (settings: Partial<VoiceSettings>) => Promise<void>;
}

export interface SpeechToTextProvider {
  readonly transcribe: (stream: MediaStream, signal: AbortSignal) => Promise<string>;
}

export interface TextToSpeechProvider {
  readonly speak: (text: string, signal: AbortSignal) => Promise<void>;
  readonly stop: () => void;
}

export interface WakeWordProvider {
  readonly phrase: string;
  readonly start: (stream: MediaStream, onDetected: () => void, signal: AbortSignal) => Promise<void>;
}
