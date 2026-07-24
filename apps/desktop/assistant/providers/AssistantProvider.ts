import type { ConversationSnapshot, RenameConversationRequest } from '@hanna/types';
import type { ChatMessage } from '../types/assistant';

export interface AssistantProviderCallbacks {
  readonly onUserMessage: (message: ChatMessage) => void;
  readonly onAssistantMessage: (message: ChatMessage) => void;
  readonly onAssistantChunk: (id: string, chunk: string) => void;
  readonly onAssistantComplete: (id: string) => void;
  readonly onAssistantError: (id: string, content: string) => void;
  readonly onAssistantCancelled: (id: string) => void;
}

export interface AssistantProviderRequest {
  readonly conversationId: string | null;
  readonly text: string;
  readonly callbacks: AssistantProviderCallbacks;
  readonly signal?: AbortSignal;
}

export interface AssistantProvider {
  listConversations(): Promise<ConversationSnapshot>;
  createConversation(): Promise<ConversationSnapshot>;
  selectConversation(conversationId: string): Promise<ConversationSnapshot>;
  renameConversation(conversationId: string, title: string): Promise<ConversationSnapshot>;
  deleteConversation(conversationId: string): Promise<ConversationSnapshot>;
  sendUserMessage(request: AssistantProviderRequest): Promise<void>;
}

export const createEmptySnapshot = (): ConversationSnapshot => ({
  activeConversationId: null,
  conversations: [],
});

export const toRenameConversationRequest = (
  conversationId: string,
  title: string,
): RenameConversationRequest => ({ conversationId, title });
