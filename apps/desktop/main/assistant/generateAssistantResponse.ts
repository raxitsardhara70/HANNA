import { conversationMemory } from "./conversationMemoryInstance.js";
import { getLlmProvider } from "../llm/index.js";

export async function generateAssistantResponse(
    message: string,
): Promise<string> {

    conversationMemory.addUserMessage(message);

    const response = await getLlmProvider().generate(
        conversationMemory.getMessages(),
    );

    conversationMemory.addAssistantMessage(response);

    return response;
}

