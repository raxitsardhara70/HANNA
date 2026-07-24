import type { AssistantProvider } from './AssistantProvider';

import { simulateStreaming } from '../utils/simulateStreaming';

const isAbortError = (error: unknown): boolean => error instanceof DOMException && error.name === 'AbortError';

export const mockAssistantProvider: AssistantProvider = {
  sendUserMessage: async ({ text, callbacks, signal }) => {
    callbacks.onUserMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    });

    const assistantMessageId = crypto.randomUUID();

    callbacks.onAssistantMessage({
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      streaming: true,
    });

    try {
      await simulateStreaming(
        `HANNA received: ${text}`,
        (chunk) => {
          callbacks.onAssistantChunk(assistantMessageId, chunk);
        },
        { signal },
      );

      callbacks.onAssistantComplete(assistantMessageId);
    } catch (error) {
      if (isAbortError(error)) {
        callbacks.onAssistantCancelled(assistantMessageId);
        return;
      }

      callbacks.onAssistantError(
        assistantMessageId,
        error instanceof Error ? error.message : 'Unexpected assistant stream error.',
      );
      throw error;
    }
  },
};
