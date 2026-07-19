import { ChatMessage, AIState, AssistantContextState } from "../types/assistant";

export const initialAssistantState: AssistantContextState = {
    state: "ready",
    isMuted: false,
    messages: [
        {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Hello! I'm HANNA. How can I help you today?",
            timestamp: Date.now(),
        },
    ],
};

export function createUserMessage(content: string): ChatMessage {
    return {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: Date.now(),
    };
}

export function createAssistantMessage(
    content: string,
    streaming = false,
): ChatMessage {
    return {
        id: crypto.randomUUID(),
        role: "assistant",
        content,
        timestamp: Date.now(),
        streaming,
    };
}

export function isBusy(state: AIState): boolean {
    return (
        state === "listening" ||
        state === "thinking" ||
        state === "speaking"
    );
}
