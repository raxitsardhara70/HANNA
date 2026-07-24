import type { ConversationManager } from '../conversation/ConversationManager.js';
import type { ConversationMessage } from '../conversation/Conversation.js';
import type { ConversationMemory } from '../ConversationMemory.js';
import type { SessionManager } from '../session/SessionManager.js';
import type { ContextMessage } from './ContextMessage.js';

export interface RuntimeContext {
  readonly appName: string;
  readonly environment: string;
  readonly nodeVersion: string;
  readonly platform: NodeJS.Platform;
  readonly arch: NodeJS.Architecture;
}

export interface ContextBuilderLimits {
  readonly maximumMessages?: number;
  readonly maximumTokens?: number;
}

export interface ContextBuilderDependencies {
  readonly conversationManager: ConversationManager;
  readonly sessionManager: SessionManager;
  readonly workingMemory: ConversationMemory;
  readonly runtimeContext?: RuntimeContext;
}

export interface ContextBuilderOptions extends ContextBuilderLimits {
  readonly summarizer?: ContextSummarizer;
}

export interface ContextBuildInput extends ContextBuilderOptions {
  readonly conversationId?: string;
}

export interface ContextSummarizer {
  summarize(messages: readonly ContextMessage[]): readonly ContextMessage[];
}

export interface ConversationMessageContextAdapter {
  toContextMessage(message: ConversationMessage): ContextMessage;
}
