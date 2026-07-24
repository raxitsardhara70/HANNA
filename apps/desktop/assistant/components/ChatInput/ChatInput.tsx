import { useRef, useState } from 'react';

import styles from './ChatInput.module.css';

import { useAssistantProvider } from '../../providers/useAssistantProvider';
import { useAIState } from '../../state/useAIState';

export function ChatInput() {
  const [text, setText] = useState('');
  const activeRequestRef = useRef<AbortController | null>(null);

  const {
    addMessage,
    appendToMessage,
    finalizeMessage,
    markMessageError,
    setState,
    activeConversationId,
    loadConversations,
  } = useAIState();
  const provider = useAssistantProvider();

  async function sendMessage() {
    const value = text.trim();

    if (!value || activeRequestRef.current !== null) return;

    const abortController = new AbortController();
    activeRequestRef.current = abortController;

    setText('');
    setState('thinking');

    try {
      await provider.sendUserMessage({
        conversationId: activeConversationId,
        text: value,
        signal: abortController.signal,
        callbacks: {
          onUserMessage: addMessage,
          onAssistantMessage: addMessage,
          onAssistantChunk: appendToMessage,
          onAssistantComplete: finalizeMessage,
          onAssistantCancelled: finalizeMessage,
          onAssistantError: (id, content) => {
            markMessageError(id, content);
            setState('error');
          },
        },
      });

      if (!abortController.signal.aborted) {
        await loadConversations();
        setState('ready');
      }
    } catch {
      setState('error');
    } finally {
      activeRequestRef.current = null;
    }
  }

  return (
    <div className={styles.container}>
      <input
        value={text}
        onChange={(e) => {
          setText(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            void sendMessage();
          }
        }}
        placeholder="Ask HANNA anything..."
        className={styles.input}
      />

      <button onClick={() => void sendMessage()} className={styles.sendButton}>
        Send
      </button>
    </div>
  );
}
