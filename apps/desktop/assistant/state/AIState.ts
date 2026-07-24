import type { AssistantContextState } from '../types/assistant';

export const initialAssistantState: AssistantContextState = {
  state: 'loading',
  conversations: [],
  activeConversationId: null,
  messages: [],
  isMuted: false,
};
