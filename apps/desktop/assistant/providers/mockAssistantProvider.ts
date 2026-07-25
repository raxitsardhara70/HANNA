import type { ConversationDto, ConversationMessageDto, ConversationSnapshot } from '@hanna/types';
import type { AssistantProvider } from './AssistantProvider';
import { simulateStreaming } from '../utils/simulateStreaming';

const DEFAULT_CONVERSATION_TITLE = 'New conversation';

const isAbortError = (error: unknown): boolean => error instanceof DOMException && error.name === 'AbortError';

let activeConversationId: string | null = null;
let conversations: ConversationDto[] = [];

const snapshot = (): ConversationSnapshot => ({ activeConversationId, conversations });
const createConversationDto = (): ConversationDto => {
  const now = new Date().toISOString();
  return { id: crypto.randomUUID(), title: DEFAULT_CONVERSATION_TITLE, createdAt: now, updatedAt: now, messages: [] };
};

const titleFromMessage = (content: string): string => {
  const normalized = content.trim().replace(/\s+/g, ' ');

  if (normalized.length === 0) {
    return DEFAULT_CONVERSATION_TITLE;
  }

  return normalized.length > 40 ? `${normalized.slice(0, 37)}...` : normalized;
};

const ensureConversation = (conversationId: string | null): ConversationDto => {
  if (conversationId !== null) {
    const conversation = conversations.find((candidate) => candidate.id === conversationId);

    if (conversation !== undefined) {
      activeConversationId = conversation.id;
      return conversation;
    }
  }

  if (activeConversationId !== null) {
    const activeConversation = conversations.find((candidate) => candidate.id === activeConversationId);

    if (activeConversation !== undefined) {
      return activeConversation;
    }
  }

  const conversation = createConversationDto();
  conversations = [conversation, ...conversations];
  activeConversationId = conversation.id;
  return conversation;
};

const updateConversation = (conversationId: string, update: (conversation: ConversationDto) => ConversationDto): void => {
  conversations = conversations.map((conversation) => conversation.id === conversationId ? update(conversation) : conversation);
};

const appendMessage = (conversationId: string, message: ConversationMessageDto): void => {
  updateConversation(conversationId, (conversation) => {
    const now = new Date().toISOString();
    return {
      ...conversation,
      title: conversation.messages.length === 0 && message.role === 'user' ? titleFromMessage(message.content) : conversation.title,
      updatedAt: now,
      messages: [...conversation.messages, message],
    };
  });
};

const updateAssistantMessage = (conversationId: string, messageId: string, update: (message: ConversationMessageDto) => ConversationMessageDto): void => {
  updateConversation(conversationId, (conversation) => ({
    ...conversation,
    updatedAt: new Date().toISOString(),
    messages: conversation.messages.map((message) => message.id === messageId && message.role === 'assistant' ? update(message) : message),
  }));
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
  sendUserMessage: async ({ conversationId, text, callbacks, signal }) => {
    const conversation = ensureConversation(conversationId);
    const userMessage: ConversationMessageDto = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
      streaming: false,
    };
    appendMessage(conversation.id, userMessage);
    callbacks.onUserMessage(userMessage);

    const assistantMessage: ConversationMessageDto = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      streaming: true,
    };
    appendMessage(conversation.id, assistantMessage);
    callbacks.onAssistantMessage(assistantMessage);

    try {
      await simulateStreaming(`HANNA received: ${text}`, (chunk) => {
        updateAssistantMessage(conversation.id, assistantMessage.id, (message) => ({
          ...message,
          content: `${message.content}${chunk}`,
          streaming: true,
        }));
        callbacks.onAssistantChunk(assistantMessage.id, chunk);
      }, { signal });
      updateAssistantMessage(conversation.id, assistantMessage.id, (message) => ({ ...message, streaming: false }));
      callbacks.onAssistantComplete(assistantMessage.id);
    } catch (error) {
      updateAssistantMessage(conversation.id, assistantMessage.id, (message) => ({ ...message, streaming: false }));
      if (isAbortError(error)) {
        callbacks.onAssistantCancelled(assistantMessage.id);
        return;
      }
      callbacks.onAssistantError(assistantMessage.id, error instanceof Error ? error.message : 'Unexpected assistant stream error.');
      throw error;
    }
  },
};
