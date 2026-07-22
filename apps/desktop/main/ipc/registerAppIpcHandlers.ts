import { app, ipcMain, type WebContents } from 'electron';
import { ipcChannels } from '@hanna/ipc';
import { appMetadata } from '@hanna/shared';
import { generateAssistantResponse, streamAssistantResponse } from '../assistant/generateAssistantResponse.js';
import type {
  AssistantStreamEvent,
  AssistantStreamRequest,
  RuntimeConfig,
  SystemSnapshot,
} from '@hanna/types';

interface ActiveAssistantStream {
  readonly abortController: AbortController;
  readonly sender: WebContents;
}

const activeStreams = new Map<string, ActiveAssistantStream>();

const createStreamCancelledError = (): DOMException =>
  new DOMException('Assistant stream was cancelled.', 'AbortError');

const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === 'AbortError';

const serializeError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unexpected assistant stream error.';
};

const sendStreamEvent = (sender: WebContents, event: AssistantStreamEvent): void => {
  if (!sender.isDestroyed()) {
    sender.send(ipcChannels.assistantStreamEvent, event);
  }
};

const cleanupStream = (requestId: string): void => {
  activeStreams.delete(requestId);
};

const startAssistantStream = async (
  sender: WebContents,
  request: AssistantStreamRequest,
): Promise<void> => {
  if (activeStreams.has(request.requestId)) {
    throw new Error(`Assistant stream already exists for request ${request.requestId}.`);
  }

  const abortController = new AbortController();
  const messageId = crypto.randomUUID();

  const abortOnSenderDestroyed = (): void => {
    abortController.abort(createStreamCancelledError());
  };

  sender.once('destroyed', abortOnSenderDestroyed);

  activeStreams.set(request.requestId, {
    abortController,
    sender,
  });

  sendStreamEvent(sender, {
    messageId,
    requestId: request.requestId,
    timestamp: Date.now(),
    type: 'streamStart',
  });

  try {
    for await (const chunk of streamAssistantResponse(request.message, abortController.signal)) {
      sendStreamEvent(sender, {
        chunk,
        messageId,
        requestId: request.requestId,
        type: 'streamChunk',
      });
    }

    sendStreamEvent(sender, {
      messageId,
      requestId: request.requestId,
      type: 'streamComplete',
    });
  } catch (error) {
    if (isAbortError(error)) {
      sendStreamEvent(sender, {
        messageId,
        requestId: request.requestId,
        type: 'streamCancelled',
      });
      return;
    }

    sendStreamEvent(sender, {
      error: serializeError(error),
      messageId,
      requestId: request.requestId,
      type: 'streamError',
    });
  } finally {
    sender.removeListener('destroyed', abortOnSenderDestroyed);
    cleanupStream(request.requestId);
  }
};

const cancelAssistantStream = (requestId: string): void => {
  const stream = activeStreams.get(requestId);

  if (stream === undefined) {
    return;
  }

  stream.abortController.abort(createStreamCancelledError());
};

export const registerAppIpcHandlers = (config: RuntimeConfig): void => {
  ipcMain.handle(ipcChannels.appGetMetadata, () => appMetadata);

  ipcMain.handle(ipcChannels.appGetConfig, () => config);

  ipcMain.handle(
    ipcChannels.appGetSystemSnapshot,
    (): SystemSnapshot => ({
      arch: process.arch,
      electronVersion: process.versions.electron,
      nodeVersion: process.versions.node,
      platform: process.platform,
    }),
  );

  ipcMain.handle(ipcChannels.assistantSendMessage, async (_event, message: string) => ({
    text: await generateAssistantResponse(message),
  }));

  ipcMain.handle(ipcChannels.assistantStartStream, (event, request: AssistantStreamRequest) => {
    void startAssistantStream(event.sender, request);
  });

  ipcMain.on(ipcChannels.assistantCancelStream, (_event, requestId: string) => {
    cancelAssistantStream(requestId);
  });

  app.on('before-quit', () => {
    for (const stream of activeStreams.values()) {
      stream.abortController.abort(createStreamCancelledError());
    }

    activeStreams.clear();

    ipcMain.removeHandler(ipcChannels.appGetMetadata);
    ipcMain.removeHandler(ipcChannels.appGetConfig);
    ipcMain.removeHandler(ipcChannels.appGetSystemSnapshot);
    ipcMain.removeHandler(ipcChannels.assistantSendMessage);
    ipcMain.removeHandler(ipcChannels.assistantStartStream);
    ipcMain.removeAllListeners(ipcChannels.assistantCancelStream);
  });
};
