import { randomUUID } from 'node:crypto';

import type {
  AppendMessageOptions,
  Conversation,
  ConversationMessage,
  CreateConversationOptions,
  UpdateAssistantMessageOptions,
} from './Conversation.js';

const DEFAULT_CONVERSATION_TITLE = 'New conversation';

export class ConversationManager {
  private readonly conversations = new Map<string, Conversation>();

  private currentConversationId: string | null = null;

  createConversation(options: CreateConversationOptions = {}): Conversation {
    const now = new Date();
    const conversation: Conversation = {
      id: options.id ?? randomUUID(),
      title: normalizeTitle(options.title ?? DEFAULT_CONVERSATION_TITLE),
      createdAt: options.createdAt ?? now,
      updatedAt: options.updatedAt ?? now,
      messages: options.messages?.map((message) => cloneMessage(message)) ?? [],
      metadata: {
        messageCount: options.messages?.length ?? 0,
      },
    };

    this.saveConversation(conversation);
    this.currentConversationId = conversation.id;

    return cloneConversation(conversation);
  }

  deleteConversation(id: string): boolean {
    const deleted = this.conversations.delete(id);

    if (this.currentConversationId === id) {
      this.currentConversationId = this.firstConversationId();
    }

    return deleted;
  }

  renameConversation(id: string, title: string): Conversation {
    const conversation = this.requireConversation(id);
    const updatedConversation: Conversation = {
      ...conversation,
      title: normalizeTitle(title),
      updatedAt: new Date(),
    };

    this.saveConversation(updatedConversation);

    return cloneConversation(updatedConversation);
  }

  getConversation(id: string): Conversation | null {
    const conversation = this.conversations.get(id);

    if (conversation === undefined) {
      return null;
    }

    return cloneConversation(conversation);
  }

  currentConversation(): Conversation | null {
    if (this.currentConversationId === null) {
      return null;
    }

    return this.getConversation(this.currentConversationId);
  }

  setCurrentConversation(id: string): Conversation {
    const conversation = this.requireConversation(id);
    this.currentConversationId = id;

    return cloneConversation(conversation);
  }

  getAllConversations(): readonly Conversation[] {
    return [...this.conversations.values()]
      .sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime())
      .map((conversation) => cloneConversation(conversation));
  }

  clearConversation(id: string): Conversation {
    const conversation = this.requireConversation(id);
    const updatedConversation: Conversation = {
      ...conversation,
      updatedAt: new Date(),
      messages: [],
      metadata: {
        messageCount: 0,
      },
    };

    this.saveConversation(updatedConversation);

    return cloneConversation(updatedConversation);
  }

  clearAll(): void {
    this.conversations.clear();
    this.currentConversationId = null;
  }

  importConversations(conversations: readonly Conversation[], currentConversationId: string | null): void {
    this.conversations.clear();

    for (const conversation of conversations) {
      this.saveConversation(conversation);
    }

    this.currentConversationId = currentConversationId !== null && this.conversations.has(currentConversationId)
      ? currentConversationId
      : this.firstConversationId();
  }

  appendUserMessage(options: AppendMessageOptions): ConversationMessage {
    return this.appendMessage('user', options);
  }

  appendAssistantMessage(options: AppendMessageOptions): ConversationMessage {
    return this.appendMessage('assistant', options);
  }

  updateAssistantMessage(options: UpdateAssistantMessageOptions): ConversationMessage {
    const conversation = this.requireTargetConversation(options.conversationId);
    const message = conversation.messages.find((candidate) => candidate.id === options.messageId);

    if (message === undefined) {
      throw new Error(`Conversation message not found: ${options.messageId}`);
    }

    if (message.role !== 'assistant') {
      throw new Error(`Conversation message is not an assistant message: ${options.messageId}`);
    }

    const updatedMessage: ConversationMessage = {
      ...message,
      content: options.content,
      streaming: options.streaming ?? message.streaming,
    };

    const updatedConversation: Conversation = {
      ...conversation,
      updatedAt: new Date(),
      messages: conversation.messages.map((candidate) =>
        candidate.id === options.messageId ? updatedMessage : candidate,
      ),
    };

    this.saveConversation(updatedConversation);

    return cloneMessage(updatedMessage);
  }

  messageCount(id?: string): number {
    return this.requireTargetConversation(id).metadata.messageCount;
  }

  conversationCount(): number {
    return this.conversations.size;
  }

  touchConversation(id: string): Conversation {
    const conversation = this.requireConversation(id);
    const updatedConversation: Conversation = {
      ...conversation,
      updatedAt: new Date(),
    };

    this.saveConversation(updatedConversation);

    return cloneConversation(updatedConversation);
  }

  private appendMessage(
    role: ConversationMessage['role'],
    options: AppendMessageOptions,
  ): ConversationMessage {
    const conversation = this.requireTargetConversation(options.conversationId);
    const message: ConversationMessage = {
      id: randomUUID(),
      role,
      content: options.content,
      timestamp: Date.now(),
      streaming: options.streaming ?? false,
    };

    const updatedConversation: Conversation = {
      ...conversation,
      title: conversation.messages.length === 0 && role === 'user' ? titleFromMessage(options.content) : conversation.title,
      updatedAt: new Date(),
      messages: [...conversation.messages, message],
      metadata: {
        ...conversation.metadata,
        messageCount: conversation.metadata.messageCount + 1,
      },
    };

    this.saveConversation(updatedConversation);

    return cloneMessage(message);
  }

  private requireTargetConversation(id: string | undefined): Conversation {
    if (id !== undefined) {
      return this.requireConversation(id);
    }

    const conversation = this.currentConversation();

    if (conversation !== null) {
      return conversation;
    }

    return this.createConversation();
  }

  private requireConversation(id: string): Conversation {
    const conversation = this.conversations.get(id);

    if (conversation === undefined) {
      throw new Error(`Conversation not found: ${id}`);
    }

    return cloneConversation(conversation);
  }

  private saveConversation(conversation: Conversation): void {
    this.conversations.set(conversation.id, cloneConversation(conversation));
  }

  private firstConversationId(): string | null {
    return this.conversations.keys().next().value ?? null;
  }
}

function normalizeTitle(title: string): string {
  const normalizedTitle = title.trim();

  if (normalizedTitle.length === 0) {
    return DEFAULT_CONVERSATION_TITLE;
  }

  return normalizedTitle;
}

function cloneConversation(conversation: Conversation): Conversation {
  return {
    ...conversation,
    createdAt: new Date(conversation.createdAt),
    updatedAt: new Date(conversation.updatedAt),
    messages: conversation.messages.map((message) => cloneMessage(message)),
    metadata: {
      ...conversation.metadata,
    },
  };
}

function cloneMessage(message: ConversationMessage): ConversationMessage {
  return {
    ...message,
  };
}

function titleFromMessage(content: string): string {
  const normalized = content.trim().replace(/\s+/g, ' ');

  if (normalized.length === 0) {
    return DEFAULT_CONVERSATION_TITLE;
  }

  return normalized.length > 40 ? `${normalized.slice(0, 37)}...` : normalized;
}
