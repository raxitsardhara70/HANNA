import type { ConversationMessage } from "../assistant/ConversationMemory.js";
import type { LlmProvider } from "./LlmProvider.js";

export class MockLlmProvider implements LlmProvider {

    async generate(
        messages: readonly ConversationMessage[],
    ): Promise<string> {

        const last = [...messages]
            .reverse()
            .find(message => message.role === "user");

        return `HANNA received: ${last?.content ?? ""}`;
    }

}

