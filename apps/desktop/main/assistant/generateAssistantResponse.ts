
import { contextBuilder } from './context/contextBuilderInstance.js';


import { streamText } from './streamText.js';
import { conversationManager } from './conversation/conversationManagerInstance.js';
import { getLlmProvider } from '../llm/index.js';

export async function generateAssistantResponse(message: string): Promise<string> {
  const conversation = conversationManager.currentConversation() ?? conversationManager.createConversation();

  conversationManager.appendUserMessage({
    conversationId: conversation.id,
    content: message,
  });


  const context = contextBuilder.build({ conversationId: conversation.id });
  const response = await getLlmProvider().generate(context);

  const currentConversation = conversationManager.getConversation(conversation.id);

  if (currentConversation === null) {
    throw new Error(`Conversation not found: ${conversation.id}`);
  }

  const response = await getLlmProvider().generate(currentConversation.messages);


  conversationManager.appendAssistantMessage({
    conversationId: conversation.id,
    content: response,
  });

  return response;
}

export async function* streamAssistantResponse(
  message: string,
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const conversation = conversationManager.currentConversation() ?? conversationManager.createConversation();


  conversationManager.appendUserMessage({
    conversationId: conversation.id,
    content: message,
  });

  const context = contextBuilder.build({ conversationId: conversation.id });
  const response = await getLlmProvider().generate(context);
  const assistantMessage = conversationManager.appendAssistantMessage({
    conversationId: conversation.id,
    content: '',
    streaming: true,
  });
  let streamedResponse = '';

  try {
    for await (const chunk of streamText(response, { signal })) {
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

  conversationManager.appendUserMessage({
    conversationId: conversation.id,
    content: message,
  });

  const currentConversation = conversationManager.getConversation(conversation.id);

  if (currentConversation === null) {
    throw new Error(`Conversation not found: ${conversation.id}`);
  }

  const response = await getLlmProvider().generate(currentConversation.messages);
  const assistantMessage = conversationManager.appendAssistantMessage({
    conversationId: conversation.id,
    content: '',
    streaming: true,
  });
  let streamedResponse = '';

  try {
    for await (const chunk of streamText(response, { signal })) {
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
