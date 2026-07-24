import type { ContextMessage } from '../assistant/context/ContextMessage.js';

export interface LlmProvider {
  generate(messages: readonly ContextMessage[]): Promise<string>;
}
