import type { ChatMessage } from "../types/assistant";

export interface AssistantProvider {

    sendUserMessage(
        text: string,
        callbacks: {

            onUserMessage(message: ChatMessage): void;

            onAssistantMessage(message: ChatMessage): void;

            onAssistantUpdate(
                id: string,
                content: string,
                streaming: boolean,
            ): void;

        },

    ): Promise<void>;

}
