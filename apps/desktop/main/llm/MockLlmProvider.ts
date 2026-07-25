import type { LlmPrompt } from '../assistant/prompt/Prompt.js';
import { streamText } from '../assistant/streamText.js';
import type { LlmProvider, LlmStreamOptions } from './LlmProvider.js';

export class MockLlmProvider implements LlmProvider {
  generate(prompt: LlmPrompt): Promise<string> {
    const last = [...prompt.messages].reverse().find((message) => message.role === 'user');

    return Promise.resolve(`HANNA received: ${last?.content ?? ''}`);
  }

  async *stream(prompt: LlmPrompt, options: LlmStreamOptions = {}): AsyncGenerator<string> {
    const text = await this.generate(prompt);

    yield* streamText(text, { signal: options.signal });
  }
}
