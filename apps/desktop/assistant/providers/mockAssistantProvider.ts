import type { ConversationDto, ConversationSnapshot } from '@hanna/types';
import type { AssistantProvider } from './AssistantProvider';
import { simulateStreaming } from '../utils/simulateStreaming';

const isAbortError = (error: unknown): boolean => error instanceof DOMException && error.name === 'AbortError';

let activeConversationId: string | null = null;
let conversations: ConversationDto[] = [];

const snapshot = (): ConversationSnapshot => ({ activeConversationId, conversations });
const createConversationDto = (): ConversationDto => {
  const now = new Date().toISOString();
  return { id: crypto.randomUUID(), title: 'New conversation', createdAt: now, updatedAt: now, messages: [] };
};

export const mockAssistantProvider: AssistantProvider = {
  listConversations: () => {
    if (conversations.length === 0) {
      const conversation = createConversationDto();
      conversations = [conversation];
      activeConversationId = conversation.id;
    }
    return Promise.resolve(snapshot());
  },
  createConversation: () => {
    const conversation = createConversationDto();
    conversations = [conversation, ...conversations];
    activeConversationId = conversation.id;
    return Promise.resolve(snapshot());
  },
  selectConversation: (conversationId) => {
    activeConversationId = conversationId;
    return Promise.resolve(snapshot());
  },
  renameConversation: (conversationId, title) => {
    conversations = conversations.map((conversation) => conversation.id === conversationId ? { ...conversation, title } : conversation);
    return Promise.resolve(snapshot());
  },
  deleteConversation: (conversationId) => {
    conversations = conversations.filter((conversation) => conversation.id !== conversationId);
    activeConversationId = conversations[0]?.id ?? null;
    return Promise.resolve(snapshot());
  },
  sendUserMessage: async ({ text, callbacks, signal }) => {
    callbacks.onUserMessage({ id: crypto.randomUUID(), role: 'user', content: text, timestamp: Date.now() });
    const assistantMessageId = crypto.randomUUID();
    callbacks.onAssistantMessage({ id: assistantMessageId, role: 'assistant', content: '', timestamp: Date.now(), streaming: true });

    try {
      await simulateStreaming(`HANNA received: ${text}`, (chunk) => {
        callbacks.onAssistantChunk(assistantMessageId, chunk);
      }, { signal });
      callbacks.onAssistantComplete(assistantMessageId);
    } catch (error) {
      if (isAbortError(error)) {
        callbacks.onAssistantCancelled(assistantMessageId);
        return;
      }
      callbacks.onAssistantError(assistantMessageId, error instanceof Error ? error.message : 'Unexpected assistant stream error.');
      throw error;
    }
  },
};
