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
  readonly text: string;
  readonly callbacks: AssistantProviderCallbacks;
  readonly signal?: AbortSignal;
}

export interface AssistantProvider {
  sendUserMessage(request: AssistantProviderRequest): Promise<void>;
}
