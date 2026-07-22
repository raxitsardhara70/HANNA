export type AIState = 'offline' | 'ready' | 'listening' | 'thinking' | 'speaking' | 'error';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  streaming?: boolean;
  error?: boolean;
}

export interface AssistantContextState {
  state: AIState;
  messages: ChatMessage[];
  isMuted: boolean;
}

export interface AssistantContextActions {
  setState: (state: AIState) => void;
  setMuted: (value: boolean) => void;

  addMessage: (message: ChatMessage) => void;

  appendToMessage: (id: string, chunk: string) => void;

  updateMessage: (id: string, content: string, streaming?: boolean) => void;

  finalizeMessage: (id: string) => void;

  markMessageError: (id: string, content: string) => void;

  clearMessages: () => void;
}

export type AssistantContextValue = AssistantContextState & AssistantContextActions;
