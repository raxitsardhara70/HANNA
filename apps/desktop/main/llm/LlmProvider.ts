import type { LlmPrompt } from '../assistant/prompt/Prompt.js';

export interface LlmStreamOptions {
  readonly signal?: AbortSignal;
}

export interface LlmProvider {
  generate(prompt: LlmPrompt): Promise<string>;
  stream(prompt: LlmPrompt, options?: LlmStreamOptions): AsyncGenerator<string>;

export interface LlmProvider {
  generate(prompt: LlmPrompt): Promise<string>;
}
