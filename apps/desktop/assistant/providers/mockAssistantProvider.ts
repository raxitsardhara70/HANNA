import type { AssistantProvider } from './AssistantProvider';

import { simulateStreaming } from '../utils/simulateStreaming';

export const mockAssistantProvider: AssistantProvider = {
  sendUserMessage: async (text, callbacks) => {
    callbacks.onUserMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    });

    await simulateStreaming(
      'Hello! I am HANNA. Streaming is working correctly.',
      (message) => {
        callbacks.onAssistantMessage(message);
      },
      (id, content, streaming) => {
        callbacks.onAssistantUpdate(id, content, streaming);
      },
    );
  },
};
