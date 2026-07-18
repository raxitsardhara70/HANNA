import type { HannaApi } from '@hanna/types';

export const getRendererIpcClient = (): HannaApi => {
  if (!window.hanna) {
    throw new Error('HANNA IPC is not available. The application is running outside Electron.');
  }

  return window.hanna;
};