import type { AssistantProvider } from './AssistantProvider';

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

    const response = await window.hanna.assistant.sendMessage(text);

    callbacks.onAssistantMessage({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: response.text,
      timestamp: Date.now(),
    });
  },
};
