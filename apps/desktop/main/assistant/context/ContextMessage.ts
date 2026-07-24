export type ContextMessageRole = 'system' | 'user' | 'assistant';

export type ContextMessageSource =
  | 'system'
  | 'memory'
  | 'conversation'
  | 'runtime'
  | 'session'
  | 'settings'
  | 'tool';

export const contextPriority = {
  system: 0,
  memory: 1,
  conversation: 2,
  runtime: 3,
  tool: 4,
} as const;

export type ContextMessagePriority = (typeof contextPriority)[keyof typeof contextPriority];

export interface ContextMessage {
  readonly id: string;
  readonly role: ContextMessageRole;
  readonly content: string;
  readonly priority: ContextMessagePriority;
  readonly source: ContextMessageSource;
  readonly timestamp: number;
}
