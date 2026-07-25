import { app, BrowserWindow, session } from 'electron';
import { loadRuntimeConfig } from '@hanna/config';
import { createLogger } from '@hanna/logger';
import { registerAppIpcHandlers } from './ipc/registerAppIpcHandlers.js';
import { registerVoiceIpcHandlers, unregisterVoiceIpcHandlers } from './ipc/registerVoiceIpcHandlers.js';
import { VoiceManager } from './voice/VoiceManager.js';
import { createMainWindow } from './window/windowManager.js';

const config = loadRuntimeConfig();
const logger = createLogger('desktop:main', config.logLevel);
let voiceManager: VoiceManager | null = null;

app.on('ready', () => {
  voiceManager = new VoiceManager(session.defaultSession, config.logLevel);


const voiceManager = new VoiceManager(session.defaultSession, config.logLevel);

app.on('ready', () => {
  voiceManager.registerPermissionHandlers();
  registerVoiceIpcHandlers(voiceManager);
  registerAppIpcHandlers(config);
  void createMainWindow(config, logger);
});

app.on('before-quit', () => {
  unregisterVoiceIpcHandlers();
  voiceManager?.dispose();
  voiceManager = null;


  voiceManager.dispose();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    void createMainWindow(config, logger);
  }
});
