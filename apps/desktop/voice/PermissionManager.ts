import type { VoicePermissionState } from './VoiceTypes';

export class PermissionManager {
  async query(): Promise<VoicePermissionState> {
    try {
      const status = await navigator.permissions.query({ name: 'microphone' });
      if (status.state === 'granted') return 'granted';
      if (status.state === 'denied') return 'denied';
      return 'prompt';
    } catch {
      return 'unknown';
    }
  }

  async request(): Promise<VoicePermissionState> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => { track.stop(); });
    return this.query();
  }
}
