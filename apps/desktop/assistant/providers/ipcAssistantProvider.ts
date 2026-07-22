import type { AssistantProvider } from './AssistantProvider';

const isAbortError = (error: unknown): boolean => error instanceof DOMException && error.name === 'AbortError';

export const ipcAssistantProvider: AssistantProvider = {
  sendUserMessage: async ({ text, callbacks, signal }) => {
=======

export const ipcAssistantProvider: AssistantProvider = {
  async sendUserMessage(text, callbacks) {

    callbacks.onUserMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    });

    if (!window.hanna?.assistant) {
      throw new Error('HANNA assistant IPC is not available.');
    }

    const assistantMessageIds: string[] = [];

    const stream = window.hanna.assistant.streamMessage(text, {
      onEvent: (event) => {
        if (event.type === 'streamStart') {
          assistantMessageIds[0] = event.messageId;
          callbacks.onAssistantMessage({
            id: event.messageId,
            role: 'assistant',
            content: '',
            timestamp: event.timestamp,
            streaming: true,
          });
          return;
        }

        if (event.type === 'streamChunk') {
          callbacks.onAssistantChunk(event.messageId, event.chunk);
          return;
        }

        if (event.type === 'streamComplete') {
          callbacks.onAssistantComplete(event.messageId);
          return;
        }

        if (event.type === 'streamCancelled') {
          if (event.messageId !== undefined) {
            callbacks.onAssistantCancelled(event.messageId);
          }
          return;
        }

        if (event.messageId !== undefined) {
          callbacks.onAssistantError(event.messageId, event.error);
          return;
        }

        const fallbackMessageId = assistantMessageIds[0] ?? crypto.randomUUID();
        callbacks.onAssistantMessage({
          id: fallbackMessageId,
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
          streaming: true,
        });
        callbacks.onAssistantError(fallbackMessageId, event.error);
      },
    });

    const abortStream = (): void => {
      stream.cancel();
    };

    signal?.addEventListener('abort', abortStream, { once: true });

    try {
      await stream.done;
    } catch (error) {
      if (isAbortError(error)) {
        const assistantMessageId = assistantMessageIds[0];
        if (assistantMessageId !== undefined) {
          callbacks.onAssistantCancelled(assistantMessageId);
        }
        return;
      }

      const assistantMessageId = assistantMessageIds[0];
      if (assistantMessageId !== undefined) {
        callbacks.onAssistantError(
          assistantMessageId,
          error instanceof Error ? error.message : 'Unexpected assistant stream error.',
        );
      }

      throw error;
    } finally {
      signal?.removeEventListener('abort', abortStream);
    }

    const response = await window.hanna.assistant.sendMessage(text);

    callbacks.onAssistantMessage({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: response.text,
      timestamp: Date.now(),
    });
  },
};
