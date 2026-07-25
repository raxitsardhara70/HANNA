import type { Session } from 'electron';
import { createLogger, type Logger } from '@hanna/logger';
import type { LogLevel, VoiceNativeDeviceSnapshot, VoiceNativePermissionSnapshot } from '@hanna/types';

export class VoiceManager {
  private readonly logger: Logger;

  constructor(private readonly session: Session, logLevel: LogLevel) {
    this.logger = createLogger('desktop:voice', logLevel);
  }

  registerPermissionHandlers(): void {
    this.session.setPermissionRequestHandler((_webContents, permission, callback) => {
      if (permission === 'media') {
        this.logger.info('Microphone permission requested.', { permission });
        callback(true);
        return;
      }
      callback(false);
    });
  }

  getPermissionSnapshot(): VoiceNativePermissionSnapshot {
    return { microphone: 'unknown' };
  }

  revokePermission(): VoiceNativePermissionSnapshot {
    this.logger.info('Microphone permission revoked by user action.');
    return { microphone: 'denied' };
  }

  getDeviceSnapshot(): VoiceNativeDeviceSnapshot {
    return { hasMediaDevices: true };
  }

  dispose(): void {
    this.session.setPermissionRequestHandler(null);
  }
}
