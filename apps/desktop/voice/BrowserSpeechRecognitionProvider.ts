import { getSpeechRecognitionConstructor, type BrowserSpeechRecognition } from './browserSpeechRecognitionTypes';
import type { SpeechRecognitionProvider } from './SpeechRecognitionProvider';
import type { SpeechRecognitionEventHandler, SpeechRecognitionResult, SpeechRecognitionSettings } from './SpeechRecognitionTypes';

const errorCodeFromProvider = (error: string) => {
  if (error === 'not-allowed' || error === 'service-not-allowed') return 'permissionDenied';
  if (error === 'network') return 'network';
  if (error === 'no-speech') return 'timeout';
  return 'unknown';
};

export class BrowserSpeechRecognitionProvider implements SpeechRecognitionProvider {
  private recognition: BrowserSpeechRecognition | null = null;
  private silenceTimer: number | null = null;
  private cancelled = false;

  isSupported(): boolean {
    return getSpeechRecognitionConstructor() !== null;
  }

  start(settings: SpeechRecognitionSettings, onEvent: SpeechRecognitionEventHandler): void {
    const Recognition = getSpeechRecognitionConstructor();
    if (Recognition === null) {
      onEvent({ error: { code: 'unsupported', message: 'Speech recognition is not available in this runtime.' }, timestamp: Date.now(), type: 'RecognitionError' });
      return;
    }

    this.cancelled = false;
    const recognition = new Recognition();
    recognition.continuous = settings.continuous;
    recognition.interimResults = settings.interimResults;
    recognition.lang = settings.language;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      this.resetSilenceTimer(settings, onEvent);
      onEvent({ timestamp: Date.now(), type: 'RecognitionStarted' });
    };
    recognition.onresult = (event) => {
      this.resetSilenceTimer(settings, onEvent);
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result === undefined) continue;
        const alternatives = Array.from({ length: result.length }, (_value, alternativeIndex) => result[alternativeIndex])
          .filter((alternative): alternative is NonNullable<typeof alternative> => alternative !== undefined)
          .map((alternative) => ({ confidence: alternative.confidence, transcript: alternative.transcript }));
        const primary = alternatives[0];
        if (primary === undefined) continue;
        const payload: SpeechRecognitionResult = {
          alternatives,
          confidence: primary.confidence,
          isFinal: result.isFinal,
          transcript: primary.transcript.trim(),
        };
        onEvent({ result: payload, timestamp: Date.now(), type: result.isFinal ? 'FinalResult' : 'PartialResult' });
      }
    };
    recognition.onerror = (event) => {
      onEvent({ error: { code: errorCodeFromProvider(event.error), message: event.message || event.error }, timestamp: Date.now(), type: 'RecognitionError' });
    };
    recognition.onend = () => {
      this.clearSilenceTimer();
      onEvent({ timestamp: Date.now(), type: this.cancelled ? 'RecognitionCancelled' : 'RecognitionStopped' });
      if (settings.autoRestart && !this.cancelled) {
        window.setTimeout(() => { this.start(settings, onEvent); }, 250);
      }
    };
    this.recognition = recognition;
    recognition.start();
  }

  stop(): void {
    this.cancelled = false;
    this.clearSilenceTimer();
    this.recognition?.stop();
  }

  cancel(): void {
    this.cancelled = true;
    this.clearSilenceTimer();
    this.recognition?.abort();
  }

  private resetSilenceTimer(settings: SpeechRecognitionSettings, onEvent: SpeechRecognitionEventHandler): void {
    this.clearSilenceTimer();
    if (settings.silenceTimeoutMs <= 0) return;
    this.silenceTimer = window.setTimeout(() => {
      onEvent({ timestamp: Date.now(), type: 'SilenceDetected' });
      if (!settings.continuous) this.stop();
    }, settings.silenceTimeoutMs);
  }

  private clearSilenceTimer(): void {
    if (this.silenceTimer !== null) window.clearTimeout(this.silenceTimer);
    this.silenceTimer = null;
  }
}
