import { getLlmProvider } from '../llm/index.js';
import { contextBuilder } from './context/contextBuilderInstance.js';
import { conversationManager } from './conversation/conversationManagerInstance.js';
import { promptBuilder } from './prompt/promptBuilderInstance.js';
import { streamText } from './streamText.js';

export async function generateAssistantResponse(message: string, conversationId?: string): Promise<string> {
  const conversation = conversationId === undefined
    ? conversationManager.currentConversation() ?? conversationManager.createConversation()
    : conversationManager.setCurrentConversation(conversationId);

  conversationManager.appendUserMessage({
    conversationId: conversation.id,
    content: message,
  });

  const context = contextBuilder.build({ conversationId: conversation.id });
  const prompt = promptBuilder.build({ messages: context });
  const generatedText = await getLlmProvider().generate(prompt);

  conversationManager.appendAssistantMessage({
    conversationId: conversation.id,
    content: generatedText,
  });

  return generatedText;
}

export async function* streamAssistantResponse(
  message: string,
  signal?: AbortSignal,
  conversationId?: string,
): AsyncGenerator<string> {
  const conversation = conversationId === undefined
    ? conversationManager.currentConversation() ?? conversationManager.createConversation()
    : conversationManager.setCurrentConversation(conversationId);

  conversationManager.appendUserMessage({
    conversationId: conversation.id,
    content: message,
  });

  const context = contextBuilder.build({ conversationId: conversation.id });
  const prompt = promptBuilder.build({ messages: context });
  const generatedText = await getLlmProvider().generate(prompt);
  const assistantMessage = conversationManager.appendAssistantMessage({
    conversationId: conversation.id,
    content: '',
    streaming: true,
  });
  let streamedResponse = '';

  try {
    for await (const chunk of streamText(generatedText, { signal })) {
      streamedResponse += chunk;
      conversationManager.updateAssistantMessage({
        conversationId: conversation.id,
        messageId: assistantMessage.id,
        content: streamedResponse,
        streaming: true,
      });
      yield chunk;
    }
  } finally {
    conversationManager.updateAssistantMessage({
      conversationId: conversation.id,
      messageId: assistantMessage.id,
      content: streamedResponse,
      streaming: false,
    });
  }
}
