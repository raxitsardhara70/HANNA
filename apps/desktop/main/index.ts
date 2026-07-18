import { app, BrowserWindow } from 'electron';
import { loadRuntimeConfig } from '@hanna/config';
import { createLogger } from '@hanna/logger';
import { registerAppIpcHandlers } from './ipc/registerAppIpcHandlers.js';
import { createMainWindow } from './window/windowManager.js';

const config = loadRuntimeConfig();
const logger = createLogger('desktop:main', config.logLevel);

app.on('ready', () => {
  registerAppIpcHandlers(config);
  void createMainWindow(config, logger);
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
