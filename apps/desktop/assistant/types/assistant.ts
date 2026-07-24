import type { ConversationDto } from '@hanna/types';

export type AIState = 'offline' | 'ready' | 'loading' | 'listening' | 'thinking' | 'speaking' | 'error';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  streaming?: boolean;
  error?: boolean;
}

export interface ConversationSummary {
  readonly id: string;
  readonly title: string;
  readonly updatedAt: number;
  readonly createdAt: number;
  readonly messageCount: number;
}

export interface AssistantContextState {
  state: AIState;
  conversations: ConversationSummary[];
  activeConversationId: string | null;
  messages: ChatMessage[];
  isMuted: boolean;
  isStreaming: boolean;
}

export interface AssistantContextActions {
  setState: (state: AIState) => void;
  setMuted: (value: boolean) => void;
  loadConversations: () => Promise<void>;
  createConversation: () => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  renameConversation: (conversationId: string, title: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  stopGeneration: () => void;
  retryLastMessage: () => Promise<void>;
  regenerateResponse: () => Promise<void>;
  copyResponse: (messageId: string) => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  appendToMessage: (id: string, chunk: string) => void;
  updateMessage: (id: string, content: string, streaming?: boolean) => void;
  finalizeMessage: (id: string) => void;
  markMessageError: (id: string, content: string) => void;
  clearMessages: () => void;
}

export type AssistantContextValue = AssistantContextState & AssistantContextActions;

export function conversationToSummary(conversation: ConversationDto): ConversationSummary {
  return {
    id: conversation.id,
    title: conversation.title,
    createdAt: Date.parse(conversation.createdAt),
    updatedAt: Date.parse(conversation.updatedAt),
    messageCount: conversation.messages.length,
  };
}

export function conversationToMessages(conversation: ConversationDto | undefined): ChatMessage[] {
  return conversation?.messages.map((message) => ({ ...message })) ?? [];
}
