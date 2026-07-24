import { getLlmProvider } from '../llm/index.js';
import { contextBuilder } from './context/contextBuilderInstance.js';
import { conversationManager } from './conversation/conversationManagerInstance.js';
import { promptBuilder } from './prompt/promptBuilderInstance.js';

export type AssistantResponseStreamUpdate =
  | {
      readonly type: 'start';
      readonly messageId: string;
      readonly timestamp: number;
    }
  | {
      readonly type: 'chunk';
      readonly messageId: string;
      readonly chunk: string;
    };

export async function generateAssistantResponse(message: string, conversationId?: string): Promise<string> {
  const conversation = resolveConversation(conversationId);

import { streamText } from './streamText.js';

export async function generateAssistantResponse(message: string, conversationId?: string): Promise<string> {
  const conversation = conversationId === undefined
    ? conversationManager.currentConversation() ?? conversationManager.createConversation()
    : conversationManager.setCurrentConversation(conversationId);

  conversationManager.appendUserMessage({
    conversationId: conversation.id,
    content: message,
  });

  const prompt = promptBuilder.build({ messages: contextBuilder.build({ conversationId: conversation.id }) });
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
): AsyncGenerator<AssistantResponseStreamUpdate> {
  const conversation = resolveConversation(conversationId);

=======
): AsyncGenerator<string> {

  const conversation = conversationId === undefined
    ? conversationManager.currentConversation() ?? conversationManager.createConversation()
    : conversationManager.setCurrentConversation(conversationId);

  const conversation = conversationManager.currentConversation() ?? conversationManager.createConversation();

  conversationManager.appendUserMessage({
    conversationId: conversation.id,
    content: message,
  });

  const prompt = promptBuilder.build({ messages: contextBuilder.build({ conversationId: conversation.id }) });

  const context = contextBuilder.build({ conversationId: conversation.id });
  const prompt = promptBuilder.build({ messages: context });
  const generatedText = await getLlmProvider().generate(prompt);
  const assistantMessage = conversationManager.appendAssistantMessage({
    conversationId: conversation.id,
    content: '',
    streaming: true,
  });
  let streamedResponse = '';

  yield {
    messageId: assistantMessage.id,
    timestamp: assistantMessage.timestamp,
    type: 'start',
  };

  try {
    for await (const chunk of getLlmProvider().stream(prompt, signal === undefined ? {} : { signal })) {


  try {
    for await (const chunk of streamText(generatedText, { signal })) {
      streamedResponse += chunk;
      conversationManager.updateAssistantMessage({
        conversationId: conversation.id,
        messageId: assistantMessage.id,
        content: streamedResponse,
        streaming: true,
      });
      yield {
        chunk,
        messageId: assistantMessage.id,
        type: 'chunk',
      };
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

function resolveConversation(conversationId: string | undefined) {
  return conversationId === undefined
    ? conversationManager.currentConversation() ?? conversationManager.createConversation()
    : conversationManager.setCurrentConversation(conversationId);
}
