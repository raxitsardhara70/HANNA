import type { ContextMessage } from '../assistant/context/ContextMessage.js';
import type { ConversationMessage } from '../assistant/conversation/Conversation.js';
import type { LlmProvider } from './LlmProvider.js';

export class MockLlmProvider implements LlmProvider {
  generate(messages: readonly ContextMessage[]): Promise<string> {
    const last = [...messages].reverse().find((message) => message.role === 'user');

    return Promise.resolve(`HANNA received: ${last?.content ?? ''}`);
  }
}
