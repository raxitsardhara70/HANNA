import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BrowserWindow } from 'electron';
import type { Logger } from '@hanna/logger';
import type { RuntimeConfig } from '@hanna/types';

const currentDirectory = dirname(fileURLToPath(import.meta.url));

export const createMainWindow = async (
  config: RuntimeConfig,
  logger: Logger,
): Promise<BrowserWindow> => {
  const window = new BrowserWindow({
    backgroundColor: '#101418',
    height: 800,
    minHeight: 640,
    minWidth: 960,
    show: false,
    title: 'HANNA',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: join(currentDirectory, '../preload/index.mjs'),
      sandbox: false,
    },
    width: 1180,
  });

  window.once('ready-to-show', () => {
    window.show();
    logger.info('Main window ready');
  });

  const developmentUrl = process.env.ELECTRON_RENDERER_URL ?? process.env.VITE_DEV_SERVER_URL;

  if (config.isDevelopment && developmentUrl !== undefined) {
    await window.loadURL(developmentUrl);
    window.webContents.openDevTools({ mode: 'detach' });
    return window;
  }

  await window.loadFile(join(currentDirectory, '../renderer/index.html'));
  return window;
};
