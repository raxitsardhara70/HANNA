import { conversationMemory } from "./conversationMemoryInstance";
import { getLlmProvider } from "../llm";

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
