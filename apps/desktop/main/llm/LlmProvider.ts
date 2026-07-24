import type { ContextMessage } from '../assistant/context/ContextMessage.js';

export interface LlmProvider {
  generate(messages: readonly ContextMessage[]): Promise<string>;
import type { ConversationMessage } from '../assistant/conversation/Conversation.js';

export interface LlmProvider {
  generate(messages: readonly ConversationMessage[]): Promise<string>;
}
