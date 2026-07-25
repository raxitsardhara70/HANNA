import type { VoiceInputDevice, VoiceSettings } from './VoiceTypes';

export class MicrophoneManager {
  private stream: MediaStream | null = null;

  async listDevices(): Promise<readonly VoiceInputDevice[]> {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((device) => device.kind === 'audioinput').map((device, index) => ({
      deviceId: device.deviceId,
      groupId: device.groupId,
      label: device.label || `Microphone ${String(index + 1)}`,
    }));
  }

  async open(settings: VoiceSettings): Promise<MediaStream> {
    if (this.stream !== null) throw new Error('Microphone session already active.');
    const audio: MediaTrackConstraints = {
      autoGainControl: settings.autoGainControl,
      echoCancellation: settings.echoCancellation,
      noiseSuppression: settings.noiseSuppression,
    };
    if (settings.inputDeviceId !== null) audio.deviceId = { exact: settings.inputDeviceId };
    this.stream = await navigator.mediaDevices.getUserMedia({ audio });
    return this.stream;
  }

  currentStream(): MediaStream | null {
    return this.stream;
  }

  close(): void {
    this.stream?.getTracks().forEach((track) => { track.stop(); });
    this.stream = null;
  }
}
