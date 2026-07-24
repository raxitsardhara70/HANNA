import type { ContextMessage } from '../context/ContextMessage.js';

export interface PromptMessage {
  readonly role: ContextMessage['role'];
  readonly content: string;
}

export interface PromptBuildInput {
  readonly messages: readonly ContextMessage[];
}

export interface LlmPrompt {
  readonly messages: readonly PromptMessage[];
  readonly text: string;
}
