import type { LlmPrompt } from '../assistant/prompt/Prompt.js';

export interface LlmProvider {
  generate(prompt: LlmPrompt): Promise<string>;
}
