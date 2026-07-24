import type { ContextMessage } from '../context/ContextMessage.js';
import type { LlmPrompt, PromptBuildInput, PromptMessage } from './Prompt.js';

const ROLE_LABELS: Record<ContextMessage['role'], string> = {
  assistant: 'Assistant',
  system: 'System',
  user: 'User',
};

export class PromptBuilder {
  build(input: PromptBuildInput): LlmPrompt {
    const messages = input.messages.map((message) => toPromptMessage(message));

    return {
      messages,
      text: messages.map(formatPromptMessage).join('\n\n'),
    };
  }
}

function toPromptMessage(message: ContextMessage): PromptMessage {
  return {
    role: message.role,
    content: message.content.trim(),
  };
}

function formatPromptMessage(message: PromptMessage): string {
  return `${ROLE_LABELS[message.role]}: ${message.content}`;
}
