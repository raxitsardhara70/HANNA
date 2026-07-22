import { conversationMemory } from './conversationMemoryInstance.js';
import { streamText } from './streamText.js';
import { getLlmProvider } from '../llm/index.js';

export async function generateAssistantResponse(message: string): Promise<string> {
  conversationMemory.addUserMessage(message);

  const response = await getLlmProvider().generate(conversationMemory.getMessages());

  conversationMemory.addAssistantMessage(response);

  return response;
}

export async function* streamAssistantResponse(
  message: string,
  signal?: AbortSignal,
): AsyncGenerator<string> {
  conversationMemory.addUserMessage(message);

  const response = await getLlmProvider().generate(conversationMemory.getMessages());
  let streamedResponse = '';

  for await (const chunk of streamText(response, { signal })) {
    streamedResponse += chunk;
    yield chunk;
  }

  conversationMemory.addAssistantMessage(streamedResponse);
}
