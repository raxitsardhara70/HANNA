export type ConversationMessageRole = 'system' | 'user' | 'assistant';

export interface ConversationMessage {
  readonly id: string;
  readonly role: ConversationMessageRole;
  readonly content: string;
  readonly timestamp: number;
  readonly streaming: boolean;
}

export interface ConversationMetadata {
  readonly messageCount: number;
}

export interface Conversation {
  readonly id: string;
  readonly title: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly messages: readonly ConversationMessage[];
  readonly metadata: ConversationMetadata;
}

export interface CreateConversationOptions {
  readonly title?: string;
}

export interface AppendMessageOptions {
  readonly conversationId?: string;
  readonly content: string;
  readonly streaming?: boolean;
}

export interface UpdateAssistantMessageOptions {
  readonly conversationId?: string;
  readonly messageId: string;
  readonly content: string;
  readonly streaming?: boolean;
}
