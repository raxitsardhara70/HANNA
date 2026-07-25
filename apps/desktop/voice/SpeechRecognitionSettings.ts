import { defaultSpeechRecognitionSettings } from './SpeechRecognitionState';
import type { SpeechRecognitionSettings } from './SpeechRecognitionTypes';

const storageKey = 'hanna.voice.speechRecognition.settings';
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

export class SpeechRecognitionSettingsStore {
  load(): SpeechRecognitionSettings {
    const raw = window.localStorage.getItem(storageKey);
    if (raw === null) return defaultSpeechRecognitionSettings;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!isRecord(parsed)) return defaultSpeechRecognitionSettings;
      return {
        autoRestart: typeof parsed.autoRestart === 'boolean' ? parsed.autoRestart : defaultSpeechRecognitionSettings.autoRestart,
        continuous: typeof parsed.continuous === 'boolean' ? parsed.continuous : defaultSpeechRecognitionSettings.continuous,
        interimResults: typeof parsed.interimResults === 'boolean' ? parsed.interimResults : defaultSpeechRecognitionSettings.interimResults,
        language: typeof parsed.language === 'string' && parsed.language.trim().length > 0 ? parsed.language : defaultSpeechRecognitionSettings.language,
        silenceTimeoutMs: typeof parsed.silenceTimeoutMs === 'number' ? Math.max(0, parsed.silenceTimeoutMs) : defaultSpeechRecognitionSettings.silenceTimeoutMs,
      };
    } catch {
      return defaultSpeechRecognitionSettings;
    }
  }

  save(settings: SpeechRecognitionSettings): void {
    window.localStorage.setItem(storageKey, JSON.stringify(settings));
  }
}
