import type { VoiceError, VoiceInputDevice, VoicePermissionState, VoiceSettings, VoiceState } from './VoiceTypes';

export type VoiceEvent =
  | { readonly type: 'PermissionGranted'; readonly timestamp: number }
  | { readonly type: 'PermissionDenied'; readonly timestamp: number; readonly error: VoiceError }
  | { readonly type: 'PermissionRevoked'; readonly timestamp: number }
  | { readonly type: 'ListeningStarted'; readonly timestamp: number; readonly sessionId: string }
  | { readonly type: 'ListeningStopped'; readonly timestamp: number; readonly sessionId: string }
  | { readonly type: 'ListeningCancelled'; readonly timestamp: number; readonly sessionId: string }
  | { readonly type: 'MicrophoneDisconnected'; readonly timestamp: number; readonly deviceId: string | null }
  | { readonly type: 'MicrophoneChanged'; readonly timestamp: number; readonly devices: readonly VoiceInputDevice[] }
  | { readonly type: 'AudioLevelChanged'; readonly timestamp: number; readonly level: number }
  | { readonly type: 'VoiceStateChanged'; readonly timestamp: number; readonly state: VoiceState }
  | { readonly type: 'VoiceSettingsChanged'; readonly timestamp: number; readonly settings: VoiceSettings }
  | { readonly type: 'VoicePermissionChanged'; readonly timestamp: number; readonly permission: VoicePermissionState }
  | { readonly type: 'VoiceError'; readonly timestamp: number; readonly error: VoiceError };

export type VoiceEventHandler = (event: VoiceEvent) => void;
