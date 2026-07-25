import type { VoiceSnapshot, VoiceState } from './VoiceTypes';

export const voiceStates = ['idle', 'requestingPermission', 'listening', 'processing', 'speaking', 'muted', 'disabled', 'error'] as const satisfies readonly VoiceState[];

export const createInitialVoiceSnapshot = (settings: VoiceSnapshot['settings']): VoiceSnapshot => ({
  activeSessionId: null,
  audioLevel: 0,
  devices: [],
  error: null,
  permission: 'unknown',
  settings,
  state: settings.muted ? 'muted' : 'idle',
});
