import type { VoiceNativeDeviceSnapshot, VoiceNativePermissionSnapshot } from '@hanna/types';

export class VoiceIPC {
  async getPermissionSnapshot(): Promise<VoiceNativePermissionSnapshot> {
    return window.hanna?.voice.getPermissionSnapshot() ?? Promise.resolve({ microphone: 'unknown' });
  }

  async revokePermission(): Promise<VoiceNativePermissionSnapshot> {
    return window.hanna?.voice.revokePermission() ?? Promise.resolve({ microphone: 'denied' });
  }

  async getDeviceSnapshot(): Promise<VoiceNativeDeviceSnapshot> {
    return window.hanna?.voice.getDeviceSnapshot() ?? Promise.resolve({ hasMediaDevices: false });
  }
}
