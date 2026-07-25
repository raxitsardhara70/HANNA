import { ipcMain } from 'electron';
import { ipcChannels } from '@hanna/ipc';
import type { VoiceManager } from '../voice/VoiceManager';

export const registerVoiceIpcHandlers = (voiceManager: VoiceManager): void => {
  ipcMain.handle(ipcChannels.voiceGetPermissionSnapshot, () => voiceManager.getPermissionSnapshot());
  ipcMain.handle(ipcChannels.voiceRevokePermission, () => voiceManager.revokePermission());
  ipcMain.handle(ipcChannels.voiceGetDeviceSnapshot, () => voiceManager.getDeviceSnapshot());
};

export const unregisterVoiceIpcHandlers = (): void => {
  ipcMain.removeHandler(ipcChannels.voiceGetPermissionSnapshot);
  ipcMain.removeHandler(ipcChannels.voiceRevokePermission);
  ipcMain.removeHandler(ipcChannels.voiceGetDeviceSnapshot);
};
