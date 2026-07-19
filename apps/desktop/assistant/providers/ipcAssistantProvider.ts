import type { AssistantProvider } from "./AssistantProvider";

export const ipcAssistantProvider: AssistantProvider = {
    async sendUserMessage(text, callbacks) {

        callbacks.onUserMessage({
            id: crypto.randomUUID(),
            role: "user",
            content: text,
            timestamp: Date.now(),
        });

        const response = await window.hanna.assistant.sendMessage(text);

        callbacks.onAssistantMessage({
            id: crypto.randomUUID(),
            role: "assistant",
            content: response.text,
            timestamp: Date.now(),
        });
    },
};
