import { contextBridge, ipcRenderer } from 'electron';
import { ipcChannels } from '@hanna/ipc';
import type {
  AssistantStreamController,
  AssistantStreamEvent,
  AssistantStreamHandlers,
  HannaApi,
} from '@hanna/types';

const createRequestId = (): string => crypto.randomUUID();

const api: HannaApi = {
  app: {
    getConfig: () => ipcRenderer.invoke(ipcChannels.appGetConfig),
    getMetadata: () => ipcRenderer.invoke(ipcChannels.appGetMetadata),
    getSystemSnapshot: () => ipcRenderer.invoke(ipcChannels.appGetSystemSnapshot),
  },

  assistant: {
    sendMessage: (message: string) => ipcRenderer.invoke(ipcChannels.assistantSendMessage, message),
    streamMessage: (message: string, handlers: AssistantStreamHandlers): AssistantStreamController => {
      const requestId = createRequestId();

      let resolveDone: () => void;
      let rejectDone: (error: Error) => void;

      const done = new Promise<void>((resolve, reject) => {
        resolveDone = resolve;
        rejectDone = reject;
      });

      const removeStreamListener = (): void => {
        ipcRenderer.removeListener(ipcChannels.assistantStreamEvent, handleStreamEvent);
      };

      const completeStream = (): void => {
        removeStreamListener();
        resolveDone();
      };

      const failStream = (error: Error): void => {
        removeStreamListener();
        rejectDone(error);
      };

      const handleStreamEvent = (_event: Electron.IpcRendererEvent, streamEvent: AssistantStreamEvent): void => {
        if (streamEvent.requestId !== requestId) {
          return;
        }

        handlers.onEvent(streamEvent);

        if (streamEvent.type === 'streamComplete' || streamEvent.type === 'streamCancelled') {
          completeStream();
        }

        if (streamEvent.type === 'streamError') {
          failStream(new Error(streamEvent.error));
        }
      };

      ipcRenderer.on(ipcChannels.assistantStreamEvent, handleStreamEvent);

      void ipcRenderer
        .invoke(ipcChannels.assistantStartStream, {
          message,
          requestId,
        })
        .catch((error: unknown) => {
          failStream(error instanceof Error ? error : new Error('Failed to start assistant stream.'));
        });

      return {
        cancel: () => {
          ipcRenderer.send(ipcChannels.assistantCancelStream, requestId);
        },
        done,
        requestId,
      };
    },
  },
};

contextBridge.exposeInMainWorld('hanna', api);
