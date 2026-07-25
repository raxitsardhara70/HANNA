import { BrowserSpeechRecognitionProvider } from './BrowserSpeechRecognitionProvider';
import { SpeechRecognitionSettingsStore } from './SpeechRecognitionSettings';
import { createInitialSpeechRecognitionSnapshot, defaultSpeechRecognitionSettings, type SpeechRecognitionSnapshot } from './SpeechRecognitionState';
import type { SpeechRecognitionProvider } from './SpeechRecognitionProvider';
import type { SpeechRecognitionEvent, SpeechRecognitionEventHandler, SpeechRecognitionSettings } from './SpeechRecognitionTypes';

export class SpeechRecognitionService {
  private readonly provider: SpeechRecognitionProvider;
  private readonly settingsStore = new SpeechRecognitionSettingsStore();
  private readonly listeners = new Set<SpeechRecognitionEventHandler>();
  private snapshot: SpeechRecognitionSnapshot = createInitialSpeechRecognitionSnapshot(defaultSpeechRecognitionSettings);

  constructor(provider: SpeechRecognitionProvider = new BrowserSpeechRecognitionProvider()) {
    this.provider = provider;
  }

  initialize(): SpeechRecognitionSnapshot {
    const settings = this.settingsStore.load();
    this.snapshot = createInitialSpeechRecognitionSnapshot(settings);
    if (!this.provider.isSupported()) {
      this.snapshot = { ...this.snapshot, state: 'unsupported', error: 'Speech recognition is not available in this runtime.' };
    }
    return this.snapshot;
  }

  subscribe(handler: SpeechRecognitionEventHandler): () => void {
    this.listeners.add(handler);
    return () => this.listeners.delete(handler);
  }

  getSnapshot(): SpeechRecognitionSnapshot { return this.snapshot; }

  start(): void {
    if (!this.provider.isSupported()) {
      this.setSnapshot({ error: 'Speech recognition is not available in this runtime.', state: 'unsupported' });
      return;
    }
    if (this.snapshot.state === 'listening' || this.snapshot.state === 'starting') return;
    this.setSnapshot({ error: null, finalTranscript: '', partialTranscript: '', state: 'starting' });
    this.provider.start(this.snapshot.settings, this.handleEvent);
  }

  stop(): void {
    if (this.snapshot.state !== 'listening' && this.snapshot.state !== 'starting') return;
    this.setSnapshot({ state: 'stopping' });
    this.provider.stop();
  }

  cancel(): void {
    this.provider.cancel();
    this.setSnapshot({ partialTranscript: '', state: 'cancelled' });
  }

  updateSettings(patch: Partial<SpeechRecognitionSettings>): void {
    const settings = { ...this.snapshot.settings, ...patch };
    this.settingsStore.save(settings);
    this.setSnapshot({ settings });
  }

  dispose(): void {
    this.provider.cancel();
    this.listeners.clear();
  }

  private readonly handleEvent = (event: SpeechRecognitionEvent): void => {
    if (event.type === 'RecognitionStarted') this.setSnapshot({ state: 'listening' });
    if (event.type === 'RecognitionStopped') this.setSnapshot({ partialTranscript: '', state: 'idle' });
    if (event.type === 'RecognitionCancelled') this.setSnapshot({ partialTranscript: '', state: 'cancelled' });
    if (event.type === 'PartialResult') this.setSnapshot({ confidence: event.result.confidence, partialTranscript: event.result.transcript });
    if (event.type === 'FinalResult') this.setSnapshot({ confidence: event.result.confidence, finalTranscript: event.result.transcript, partialTranscript: '' });
    if (event.type === 'SilenceDetected') this.stop();
    if (event.type === 'RecognitionError') this.setSnapshot({ error: event.error.message, state: 'error' });
    this.emit(event);
  };

  private setSnapshot(patch: Partial<SpeechRecognitionSnapshot>): void {
    this.snapshot = { ...this.snapshot, ...patch };
  }

  private emit(event: SpeechRecognitionEvent): void {
    console.debug('[speech-recognition]', event);
    this.listeners.forEach((listener) => { listener(event); });
  }
}
