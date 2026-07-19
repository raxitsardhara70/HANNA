import type { ConversationMessage } from "../assistant/ConversationMemory";
import type { LlmProvider } from "./LlmProvider";

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
