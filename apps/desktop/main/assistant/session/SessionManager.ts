import { randomUUID } from "node:crypto";

import type { CreateSessionOptions, RenameSessionOptions, Session, TouchSessionOptions } from "./Session.js";

const DEFAULT_SESSION_TITLE = "New session";

export class SessionManager {

    private activeSession: Session | null = null;

    createSession(options: CreateSessionOptions = {}): Session {
        const now = new Date();
        const session: Session = {
            id: randomUUID(),
            createdAt: now,
            updatedAt: now,
            messageCount: 0,
            conversationId: options.conversationId ?? randomUUID(),
            title: normalizeTitle(options.title ?? DEFAULT_SESSION_TITLE),
        };

        this.activeSession = cloneSession(session);

        return cloneSession(session);
    }

    currentSession(): Session | null {
        if (this.activeSession === null) {
            return null;
        }

        return cloneSession(this.activeSession);
    }

    renameSession(options: RenameSessionOptions): Session {
        const session = this.requireCurrentSession();
        const updatedSession: Session = {
            ...session,
            title: normalizeTitle(options.title),
            updatedAt: new Date(),
        };

        this.activeSession = cloneSession(updatedSession);

        return cloneSession(updatedSession);
    }

    touch(options: TouchSessionOptions = {}): Session {
        const session = this.requireCurrentSession();
        const updatedSession: Session = {
            ...session,
            updatedAt: new Date(),
            messageCount: normalizeMessageCount(options.messageCount ?? session.messageCount + 1),
            conversationId: options.conversationId ?? session.conversationId,
            title: options.title === undefined ? session.title : normalizeTitle(options.title),
        };

        this.activeSession = cloneSession(updatedSession);

        return cloneSession(updatedSession);
    }

    closeSession(): Session | null {
        const session = this.activeSession;
        this.activeSession = null;

        if (session === null) {
            return null;
        }

        return cloneSession(session);
    }

    clear(): void {
        this.activeSession = null;
    }

    private requireCurrentSession(): Session {
        if (this.activeSession === null) {
            return this.createSession();
        }

        return cloneSession(this.activeSession);
    }

}

function normalizeTitle(title: string): string {
    const normalizedTitle = title.trim();

    if (normalizedTitle.length === 0) {
        return DEFAULT_SESSION_TITLE;
    }

    return normalizedTitle;
}

function normalizeMessageCount(messageCount: number): number {
    if (!Number.isSafeInteger(messageCount) || messageCount < 0) {
        throw new Error("Session message count must be a non-negative safe integer.");
    }

    return messageCount;
}

function cloneSession(session: Session): Session {
    return {
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
    };
}
