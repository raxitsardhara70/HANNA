export interface Session {
    readonly id: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly messageCount: number;
    readonly conversationId: string;
    readonly title: string;
}

export interface CreateSessionOptions {
    readonly conversationId?: string;
    readonly title?: string;
}

export interface RenameSessionOptions {
    readonly title: string;
}

export interface TouchSessionOptions {
    readonly messageCount?: number;
    readonly conversationId?: string;
    readonly title?: string;
}
