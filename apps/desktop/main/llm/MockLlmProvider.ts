import type { ConversationMessage } from '../assistant/conversation/Conversation.js';
import type { LlmProvider } from './LlmProvider.js';

export class MockLlmProvider implements LlmProvider {
  generate(messages: readonly ConversationMessage[]): Promise<string> {
    const last = [...messages].reverse().find((message) => message.role === 'user');

    return Promise.resolve(`HANNA received: ${last?.content ?? ''}`);
  }
}
