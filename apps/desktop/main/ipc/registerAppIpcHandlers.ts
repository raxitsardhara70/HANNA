import { app, ipcMain, type WebContents } from 'electron';
import { join } from 'node:path';
import { ipcChannels } from '@hanna/ipc';
import { appMetadata } from '@hanna/shared';
import { generateAssistantResponse, streamAssistantResponse } from '../assistant/generateAssistantResponse.js';
import { conversationManager } from '../assistant/conversation/conversationManagerInstance.js';
import { ConversationRepository } from '../assistant/conversation/ConversationRepository.js';
import type { Conversation } from '../assistant/conversation/Conversation.js';
import type {
  AssistantStreamEvent,
  AssistantMessageRequest,
  AssistantStreamRequest,
  ConversationDto,
  ConversationSnapshot,
  RenameConversationRequest,
  RuntimeConfig,
  SystemSnapshot,
} from '@hanna/types';

interface ActiveAssistantStream {
  readonly abortController: AbortController;
  readonly sender: WebContents;
}

const activeStreams = new Map<string, ActiveAssistantStream>();

const conversationRepository = new ConversationRepository(join(app.getPath('userData'), 'conversations.json'));

const toConversationDto = (conversation: Conversation): ConversationDto => ({
  id: conversation.id,
  title: conversation.title,
  createdAt: conversation.createdAt.toISOString(),
  updatedAt: conversation.updatedAt.toISOString(),
  messages: conversation.messages.map((message) => ({ ...message })),
});

const getConversationSnapshot = (): ConversationSnapshot => ({
  conversations: conversationManager.getAllConversations().map(toConversationDto),
  activeConversationId: conversationManager.currentConversation()?.id ?? null,
});

const persistConversations = async (): Promise<ConversationSnapshot> => {
  const snapshot = getConversationSnapshot();
  await conversationRepository.save({
    activeConversationId: snapshot.activeConversationId,
    conversations: conversationManager.getAllConversations(),
  });

  return snapshot;
};

const loadConversations = async (): Promise<void> => {
  const snapshot = await conversationRepository.load();
  conversationManager.importConversations(snapshot.conversations, snapshot.activeConversationId);

  if (conversationManager.conversationCount() === 0) {
    conversationManager.createConversation();
    await persistConversations();
  }
};


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
  const abortOnSenderDestroyed = (): void => {
    abortController.abort(createStreamCancelledError());
  };

  sender.once('destroyed', abortOnSenderDestroyed);

  activeStreams.set(request.requestId, {
    abortController,
    sender,
  });

  let messageId: string | undefined;

  try {
    for await (const update of streamAssistantResponse(request.message, abortController.signal, request.conversationId)) {
      messageId = update.messageId;

      if (update.type === 'start') {
        sendStreamEvent(sender, {
          messageId: update.messageId,
          requestId: request.requestId,
          timestamp: update.timestamp,
          type: 'streamStart',
        });
        continue;
      }

      sendStreamEvent(sender, {
        chunk: update.chunk,
        messageId: update.messageId,
        requestId: request.requestId,
        type: 'streamChunk',
      });
    }

    if (messageId !== undefined) {
      sendStreamEvent(sender, {
        messageId,
        requestId: request.requestId,
        type: 'streamComplete',
      });
    }
  } catch (error) {
    if (isAbortError(error)) {
      sendStreamEvent(sender, messageId === undefined
        ? { requestId: request.requestId, type: 'streamCancelled' }
        : { messageId, requestId: request.requestId, type: 'streamCancelled' });
      return;
    }

    sendStreamEvent(sender, messageId === undefined
      ? { error: serializeError(error), requestId: request.requestId, type: 'streamError' }
      : { error: serializeError(error), messageId, requestId: request.requestId, type: 'streamError' });
  } finally {
    await persistConversations();
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
  void loadConversations();
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

  ipcMain.handle(ipcChannels.conversationList, async () => {
    await loadConversations();
    return getConversationSnapshot();
  });

  ipcMain.handle(ipcChannels.conversationCreate, async () => {
    conversationManager.createConversation({ title: '' });
    return persistConversations();
  });

  ipcMain.handle(ipcChannels.conversationSelect, async (_event, conversationId: string) => {
    conversationManager.setCurrentConversation(conversationId);
    return persistConversations();
  });

  ipcMain.handle(ipcChannels.conversationRename, async (_event, request: RenameConversationRequest) => {
    conversationManager.renameConversation(request.conversationId, request.title);
    return persistConversations();
  });

  ipcMain.handle(ipcChannels.conversationDelete, async (_event, conversationId: string) => {
    conversationManager.deleteConversation(conversationId);
    if (conversationManager.conversationCount() === 0) {
      conversationManager.createConversation({ title: '' });
    }
    return persistConversations();
  });

  ipcMain.handle(ipcChannels.assistantSendMessage, async (_event, request: AssistantMessageRequest) => {
    const text = await generateAssistantResponse(request.message, request.conversationId);
    await persistConversations();
    return { text };
  });

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
    ipcMain.removeHandler(ipcChannels.conversationList);
    ipcMain.removeHandler(ipcChannels.conversationCreate);
    ipcMain.removeHandler(ipcChannels.conversationSelect);
    ipcMain.removeHandler(ipcChannels.conversationRename);
    ipcMain.removeHandler(ipcChannels.conversationDelete);
    ipcMain.removeHandler(ipcChannels.assistantSendMessage);
    ipcMain.removeHandler(ipcChannels.assistantStartStream);
    ipcMain.removeAllListeners(ipcChannels.assistantCancelStream);
  });
};
