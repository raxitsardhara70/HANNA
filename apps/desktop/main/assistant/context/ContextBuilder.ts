import type { ConversationMessage } from '../conversation/Conversation.js';
import type { ContextBuildInput, ContextBuilderDependencies, ContextBuilderOptions, RuntimeContext } from './ContextBuilderOptions.js';
import { contextPriority, type ContextMessage } from './ContextMessage.js';

const DEFAULT_MAXIMUM_MESSAGES = 80;
const DEFAULT_MAXIMUM_TOKENS = 8_000;
const ESTIMATED_CHARACTERS_PER_TOKEN = 4;
const SYSTEM_CONTEXT_ID = 'system:hanna';
const RUNTIME_CONTEXT_ID = 'runtime:process';
const SESSION_CONTEXT_ID = 'session:current';

export class ContextBuilder {
  constructor(private readonly dependencies: ContextBuilderDependencies) {}

  build(input: ContextBuildInput = {}): readonly ContextMessage[] {
    return this.buildFinalContext([
      ...this.buildSystemContext(),
      ...this.buildMemoryContext(),
      ...this.buildConversationContext(input.conversationId),
      ...this.buildRuntimeContext(),
    ], input);
  }

  buildSystemContext(): readonly ContextMessage[] {
    const timestamp = Date.now();
    const messages: ContextMessage[] = [
      {
        id: SYSTEM_CONTEXT_ID,
        role: 'system',
        content: 'You are HANNA, a helpful desktop assistant. Use the provided context to answer accurately and concisely.',
        priority: contextPriority.system,
        source: 'system',
        timestamp,
      },
    ];

    const session = this.dependencies.sessionManager.currentSession();

    if (session !== null) {
      messages.push({
        id: SESSION_CONTEXT_ID,
        role: 'system',
        content: [
          `Current session: ${session.title}`,
          `Session id: ${session.id}`,
          `Conversation id: ${session.conversationId}`,
          `Session messages: ${session.messageCount}`,
          `Session created: ${session.createdAt.toISOString()}`,
          `Session updated: ${session.updatedAt.toISOString()}`,
        ].join('\n'),
        priority: contextPriority.system,
        source: 'session',
        timestamp: session.updatedAt.getTime(),
      });
    }

    return messages;
  }

  buildConversationContext(conversationId?: string): readonly ContextMessage[] {
    const conversation = conversationId === undefined
      ? this.dependencies.conversationManager.currentConversation()
      : this.dependencies.conversationManager.getConversation(conversationId);

    if (conversation === null) {
      return [];
    }

    return conversation.messages.map((message) => conversationMessageToContextMessage(message));
  }

  buildMemoryContext(): readonly ContextMessage[] {
    return this.dependencies.workingMemory.getMessages().map((message, index) => ({
      id: `memory:${index}`,
      role: message.role,
      content: message.content,
      priority: contextPriority.memory,
      source: 'memory',
      timestamp: index,
    }));
  }

  buildRuntimeContext(): readonly ContextMessage[] {
    const runtimeContext = this.dependencies.runtimeContext ?? createDefaultRuntimeContext();

    return [
      {
        id: RUNTIME_CONTEXT_ID,
        role: 'system',
        content: [
          `Application: ${runtimeContext.appName}`,
          `Environment: ${runtimeContext.environment}`,
          `Node: ${runtimeContext.nodeVersion}`,
          `Platform: ${runtimeContext.platform}`,
          `Architecture: ${runtimeContext.arch}`,
        ].join('\n'),
        priority: contextPriority.runtime,
        source: 'runtime',
        timestamp: Date.now(),
      },
    ];
  }

  buildFinalContext(
    messages: readonly ContextMessage[],
    options: ContextBuilderOptions = {},
  ): readonly ContextMessage[] {
    const summarizedMessages = options.summarizer?.summarize(messages) ?? messages;
    const orderedMessages = [...summarizedMessages].sort(compareContextMessages);
    const maximumMessages = options.maximumMessages ?? DEFAULT_MAXIMUM_MESSAGES;
    const maximumTokens = options.maximumTokens ?? DEFAULT_MAXIMUM_TOKENS;

    return trimContext(orderedMessages, maximumMessages, maximumTokens);
  }
}

function conversationMessageToContextMessage(message: ConversationMessage): ContextMessage {
  return {
    id: `conversation:${message.id}`,
    role: message.role,
    content: message.content,
    priority: contextPriority.conversation,
    source: 'conversation',
    timestamp: message.timestamp,
  };
}

function compareContextMessages(left: ContextMessage, right: ContextMessage): number {
  const priorityDifference = left.priority - right.priority;

  if (priorityDifference !== 0) {
    return priorityDifference;
  }

  return left.timestamp - right.timestamp;
}

function trimContext(
  messages: readonly ContextMessage[],
  maximumMessages: number,
  maximumTokens: number,
): readonly ContextMessage[] {
  validatePositiveLimit(maximumMessages, 'maximumMessages');
  validatePositiveLimit(maximumTokens, 'maximumTokens');

  const trimmedMessages = [...messages];

  while (trimmedMessages.length > maximumMessages || estimateTokens(trimmedMessages) > maximumTokens) {
    const removableIndex = findLowestPriorityIndex(trimmedMessages);

    if (removableIndex === -1) {
      break;
    }

    trimmedMessages.splice(removableIndex, 1);
  }

  return trimmedMessages;
}

function findLowestPriorityIndex(messages: readonly ContextMessage[]): number {
  let selectedIndex = -1;

  for (let index = 0; index < messages.length; index += 1) {
    const message = messages[index];

    if (message === undefined || message.priority === contextPriority.system) {
      continue;
    }

    if (selectedIndex === -1) {
      selectedIndex = index;
      continue;
    }

    const selectedMessage = messages[selectedIndex];

    if (selectedMessage === undefined) {
      selectedIndex = index;
      continue;
    }

    if (message.priority > selectedMessage.priority) {
      selectedIndex = index;
      continue;
    }

    if (message.priority === selectedMessage.priority && message.timestamp < selectedMessage.timestamp) {
      selectedIndex = index;
    }
  }

  return selectedIndex;
}

function estimateTokens(messages: readonly ContextMessage[]): number {
  return messages.reduce((total, message) => total + estimateMessageTokens(message), 0);
}

function estimateMessageTokens(message: ContextMessage): number {
  return Math.ceil(message.content.length / ESTIMATED_CHARACTERS_PER_TOKEN);
}

function validatePositiveLimit(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new Error(`Context ${label} must be a positive safe integer.`);
  }
}

function createDefaultRuntimeContext(): RuntimeContext {
  return {
    appName: 'HANNA',
    environment: process.env.NODE_ENV ?? 'development',
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
  };
}
