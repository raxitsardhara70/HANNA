import type { ConversationMessage } from "../assistant/ConversationMemory";

export interface LlmProvider {

    generate(
        messages: readonly ConversationMessage[],
    ): Promise<string>;

}
