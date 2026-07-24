import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import type { Conversation, ConversationMessage } from './Conversation.js';

interface StoredConversationMessage {
  readonly id: string;
  readonly role: ConversationMessage['role'];
  readonly content: string;
  readonly timestamp: number;
  readonly streaming: boolean;
}

interface StoredConversation {
  readonly id: string;
  readonly title: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly messages: readonly StoredConversationMessage[];
}

interface StoredConversationState {
  readonly activeConversationId: string | null;
  readonly conversations: readonly StoredConversation[];
}

export interface ConversationRepositorySnapshot {
  readonly activeConversationId: string | null;
  readonly conversations: readonly Conversation[];
}

export class ConversationRepository {
  constructor(private readonly filePath: string) {}

  async load(): Promise<ConversationRepositorySnapshot> {
    try {
      const raw = await readFile(this.filePath, 'utf8');
      const stored = JSON.parse(raw) as StoredConversationState;

      return {
        activeConversationId: stored.activeConversationId,
        conversations: stored.conversations.map(fromStoredConversation),
      };
    } catch (error) {
      if (isNodeFileError(error) && error.code === 'ENOENT') {
        return { activeConversationId: null, conversations: [] };
      }

      throw error;
    }
  }

  async save(snapshot: ConversationRepositorySnapshot): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    const stored: StoredConversationState = {
      activeConversationId: snapshot.activeConversationId,
      conversations: snapshot.conversations.map(toStoredConversation),
    };

    await writeFile(this.filePath, `${JSON.stringify(stored, null, 2)}\n`, 'utf8');
  }
}

function toStoredConversation(conversation: Conversation): StoredConversation {
  return {
    id: conversation.id,
    title: conversation.title,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
    messages: conversation.messages.map((message) => ({ ...message })),
  };
}

function fromStoredConversation(conversation: StoredConversation): Conversation {
  return {
    id: conversation.id,
    title: conversation.title,
    createdAt: new Date(conversation.createdAt),
    updatedAt: new Date(conversation.updatedAt),
    messages: conversation.messages.map((message) => ({ ...message })),
    metadata: {
      messageCount: conversation.messages.length,
    },
  };
}

function isNodeFileError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}
