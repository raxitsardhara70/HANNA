import type { VoiceSettings } from './VoiceTypes';

const storageKey = 'hanna.voice.settings';

export const defaultVoiceSettings: VoiceSettings = {
  autoGainControl: true,
  echoCancellation: true,
  inputDeviceId: null,
  inputGain: 1,
  muted: false,
  noiseSuppression: true,
  pushToTalk: false,
  autoSend: true,
  outputDeviceId: null,
  volume: 1,
  speechSpeed: 1,
  voiceId: null,
  language: 'en-US',
  continuousMode: false,
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

export class VoiceSettingsStore {
  load(): VoiceSettings {
    const raw = window.localStorage.getItem(storageKey);
    if (raw === null) return defaultVoiceSettings;

    try {
      const parsed: unknown = JSON.parse(raw);
      if (!isRecord(parsed)) return defaultVoiceSettings;
      return {
        autoGainControl: typeof parsed.autoGainControl === 'boolean' ? parsed.autoGainControl : defaultVoiceSettings.autoGainControl,
        echoCancellation: typeof parsed.echoCancellation === 'boolean' ? parsed.echoCancellation : defaultVoiceSettings.echoCancellation,
        inputDeviceId: typeof parsed.inputDeviceId === 'string' ? parsed.inputDeviceId : null,
        inputGain: typeof parsed.inputGain === 'number' ? Math.min(2, Math.max(0, parsed.inputGain)) : defaultVoiceSettings.inputGain,
        muted: typeof parsed.muted === 'boolean' ? parsed.muted : defaultVoiceSettings.muted,
        noiseSuppression: typeof parsed.noiseSuppression === 'boolean' ? parsed.noiseSuppression : defaultVoiceSettings.noiseSuppression,
        pushToTalk: typeof parsed.pushToTalk === 'boolean' ? parsed.pushToTalk : defaultVoiceSettings.pushToTalk,
        autoSend: typeof parsed.autoSend === 'boolean' ? parsed.autoSend : defaultVoiceSettings.autoSend,
        outputDeviceId: typeof parsed.outputDeviceId === 'string' ? parsed.outputDeviceId : null,
        volume: typeof parsed.volume === 'number' ? Math.min(1, Math.max(0, parsed.volume)) : defaultVoiceSettings.volume,
        speechSpeed: typeof parsed.speechSpeed === 'number' ? Math.min(2, Math.max(0.5, parsed.speechSpeed)) : defaultVoiceSettings.speechSpeed,
        voiceId: typeof parsed.voiceId === 'string' ? parsed.voiceId : null,
        language: typeof parsed.language === 'string' && parsed.language.trim().length > 0 ? parsed.language : defaultVoiceSettings.language,
        continuousMode: typeof parsed.continuousMode === 'boolean' ? parsed.continuousMode : defaultVoiceSettings.continuousMode,
      };
    } catch {
      return defaultVoiceSettings;
    }
  }

  save(settings: VoiceSettings): void {
    window.localStorage.setItem(storageKey, JSON.stringify(settings));
  }
}
