import type { ConversationMessage } from '../assistant/conversation/Conversation.js';

export interface LlmProvider {
  generate(messages: readonly ConversationMessage[]): Promise<string>;
}
