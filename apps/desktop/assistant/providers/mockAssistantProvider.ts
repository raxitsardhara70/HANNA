import type { AssistantProvider } from "./AssistantProvider";

import { simulateStreaming } from "../utils/simulateStreaming";

export const mockAssistantProvider: AssistantProvider = {

    async sendUserMessage(
        text,
        callbacks,
    ) {

        callbacks.onUserMessage({
            id: crypto.randomUUID(),
            role: "user",
            content: text,
            timestamp: Date.now(),
        });

        await simulateStreaming(
            "Hello! I am HANNA. Streaming is working correctly.",
            callbacks.onAssistantMessage,
            callbacks.onAssistantUpdate,
        );

    },

};
