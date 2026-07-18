import { contextBridge, ipcRenderer } from 'electron';
import { ipcChannels } from '@hanna/ipc';
import type { HannaApi } from '@hanna/types';

const api: HannaApi = {
  app: {
    getConfig: () => ipcRenderer.invoke(ipcChannels.appGetConfig),
    getMetadata: () => ipcRenderer.invoke(ipcChannels.appGetMetadata),
    getSystemSnapshot: () => ipcRenderer.invoke(ipcChannels.appGetSystemSnapshot),
  },
};

contextBridge.exposeInMainWorld('hanna', api);
