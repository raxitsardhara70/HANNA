import type { HannaApi } from '@hanna/types';

export const getRendererIpcClient = (): HannaApi => {
  if (window.hanna === undefined) {
    throw new Error('HANNA IPC API is not available.');
  }

  return window.hanna;
};
