import type { LlmPrompt } from '../assistant/prompt/Prompt.js';
import type { LlmProvider } from './LlmProvider.js';

export class MockLlmProvider implements LlmProvider {
  generate(prompt: LlmPrompt): Promise<string> {
    const last = [...prompt.messages].reverse().find((message) => message.role === 'user');

    return Promise.resolve(`HANNA received: ${last?.content ?? ''}`);
  }
}
