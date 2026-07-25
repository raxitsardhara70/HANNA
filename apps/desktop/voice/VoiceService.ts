import { MicrophoneManager } from './MicrophoneManager';
import { PermissionManager } from './PermissionManager';
import { VoiceSession } from './VoiceSession';
import { VoiceIPC } from './VoiceIPC';
import type { VoiceEvent, VoiceEventHandler } from './VoiceEvents';
import { createInitialVoiceSnapshot } from './VoiceState';
import { defaultVoiceSettings, VoiceSettingsStore } from './VoiceSettings';
import type { VoiceError, VoiceSettings, VoiceSnapshot } from './VoiceTypes';

const toVoiceError = (error: unknown): VoiceError => {
  const message = error instanceof Error ? error.message : 'Unexpected voice error.';
  if (error instanceof DOMException && error.name === 'NotAllowedError') return { code: 'permissionDenied', message };
  if (error instanceof DOMException && error.name === 'NotFoundError') return { code: 'microphoneUnavailable', message };
  if (error instanceof DOMException && error.name === 'NotReadableError') return { code: 'microphoneInUse', message };
  if (message.includes('already active')) return { code: 'sessionAlreadyActive', message };
  return { code: 'unknown', message };
};

export class VoiceService {
  private readonly microphone = new MicrophoneManager();
  private readonly permissions = new PermissionManager();
  private readonly ipc = new VoiceIPC();
  private readonly settingsStore = new VoiceSettingsStore();
  private readonly listeners = new Set<VoiceEventHandler>();
  private snapshot: VoiceSnapshot = createInitialVoiceSnapshot(defaultVoiceSettings);
  private session: VoiceSession | null = null;

  async initialize(): Promise<VoiceSnapshot> {
    const settings = this.settingsStore.load();
    const nativePermission = await this.ipc.getPermissionSnapshot();
    this.snapshot = { ...createInitialVoiceSnapshot(settings), permission: nativePermission.microphone === 'unknown' ? await this.permissions.query() : nativePermission.microphone, devices: await this.microphone.listDevices() };
    navigator.mediaDevices.addEventListener('devicechange', this.handleDeviceChange);
    return this.snapshot;
  }

  subscribe(handler: VoiceEventHandler): () => void {
    this.listeners.add(handler);
    return () => this.listeners.delete(handler);
  }

  getSnapshot(): VoiceSnapshot { return this.snapshot; }

  async requestPermission(): Promise<void> {
    this.setSnapshot({ state: 'requestingPermission', error: null });
    try {
      const permission = await this.permissions.request();
      this.setSnapshot({ permission, state: this.snapshot.settings.muted ? 'muted' : 'idle', devices: await this.microphone.listDevices() });
      this.emit({ timestamp: Date.now(), type: 'PermissionGranted' });
    } catch (error) {
      const voiceError = toVoiceError(error);
      this.setSnapshot({ error: voiceError, permission: 'denied', state: 'error' });
      this.emit({ error: voiceError, timestamp: Date.now(), type: 'PermissionDenied' });
    }
  }

  async revokePermission(): Promise<void> {
    await this.cancel();
    await this.ipc.revokePermission();
    this.setSnapshot({ permission: 'revoked', state: 'disabled' });
    this.emit({ timestamp: Date.now(), type: 'PermissionRevoked' });
  }

  createSession(stream: MediaStream): VoiceSession {
    return new VoiceSession(crypto.randomUUID(), stream, this.snapshot.settings);
  }

  async start(): Promise<void> {
    if (this.session !== null) {
      this.handleError({ code: 'sessionAlreadyActive', message: 'A voice session is already active.' });
      return;
    }
    if (this.snapshot.settings.muted) return;
    try {
      const stream = await this.microphone.open(this.snapshot.settings);
      const session = this.createSession(stream);
      this.session = session;
      await session.start((level) => { this.updateAudioLevel(level); }, () => { this.handleDisconnected(); });
      this.setSnapshot({ activeSessionId: session.id, error: null, state: 'listening' });
      this.emit({ sessionId: session.id, timestamp: Date.now(), type: 'ListeningStarted' });
    } catch (error) { this.handleError(toVoiceError(error)); }
  }

  pause(): void { this.session?.pause(); }
  resume(): void { this.session?.resume(); }

  stop(): Promise<void> {
    const id = this.session?.id;
    this.disposeSession();
    this.setSnapshot({ activeSessionId: null, audioLevel: 0, state: this.snapshot.settings.muted ? 'muted' : 'idle' });
    if (id !== undefined) this.emit({ sessionId: id, timestamp: Date.now(), type: 'ListeningStopped' });
    return Promise.resolve();
  }

  cancel(): Promise<void> {
    const id = this.session?.id;
    this.disposeSession();
    this.setSnapshot({ activeSessionId: null, audioLevel: 0, state: this.snapshot.settings.muted ? 'muted' : 'idle' });
    if (id !== undefined) this.emit({ sessionId: id, timestamp: Date.now(), type: 'ListeningCancelled' });
    return Promise.resolve();
  }

  async toggle(): Promise<void> { return this.session === null ? this.start() : this.stop(); }

  async updateSettings(patch: Partial<VoiceSettings>): Promise<void> {
    const settings = { ...this.snapshot.settings, ...patch, inputGain: Math.min(2, Math.max(0, patch.inputGain ?? this.snapshot.settings.inputGain)) };
    this.settingsStore.save(settings);
    this.session?.setSettings(settings);
    this.setSnapshot({ settings, state: settings.muted ? 'muted' : this.session === null ? 'idle' : 'listening' });
    this.emit({ settings, timestamp: Date.now(), type: 'VoiceSettingsChanged' });
    if (settings.muted) await this.stop();
  }

  dispose(): void {
    navigator.mediaDevices.removeEventListener('devicechange', this.handleDeviceChange);
    this.disposeSession();
    this.listeners.clear();
  }

  private readonly handleDeviceChange = (): void => { void this.refreshDevices(); };

  private async refreshDevices(): Promise<void> {
    const devices = await this.microphone.listDevices();
    this.setSnapshot({ devices });
    this.emit({ devices, timestamp: Date.now(), type: 'MicrophoneChanged' });
  }

  private updateAudioLevel(level: number): void {
    this.setSnapshot({ audioLevel: level });
    this.emit({ level, timestamp: Date.now(), type: 'AudioLevelChanged' });
  }

  private handleDisconnected(): void {
    this.disposeSession();
    this.setSnapshot({ activeSessionId: null, audioLevel: 0, error: { code: 'deviceDisconnected', message: 'Microphone disconnected.' }, state: 'error' });
    this.emit({ deviceId: this.snapshot.settings.inputDeviceId, timestamp: Date.now(), type: 'MicrophoneDisconnected' });
  }

  private handleError(error: VoiceError): void {
    this.disposeSession();
    this.setSnapshot({ activeSessionId: null, audioLevel: 0, error, state: 'error' });
    this.emit({ error, timestamp: Date.now(), type: 'VoiceError' });
  }

  private disposeSession(): void { this.session?.dispose(); this.session = null; this.microphone.close(); }

  private setSnapshot(patch: Partial<VoiceSnapshot>): void {
    this.snapshot = { ...this.snapshot, ...patch };
    if (patch.state !== undefined) this.emit({ state: patch.state, timestamp: Date.now(), type: 'VoiceStateChanged' });
    if (patch.permission !== undefined) this.emit({ permission: patch.permission, timestamp: Date.now(), type: 'VoicePermissionChanged' });
  }

  private emit(event: VoiceEvent): void {
    console.debug('[voice]', event);
    this.listeners.forEach((listener) => { listener(event); });
  }
}
