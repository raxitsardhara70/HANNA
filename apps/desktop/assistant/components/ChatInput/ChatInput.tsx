import { useState } from 'react';

import styles from './ChatInput.module.css';

import { useAIState } from '../../state/useAIState';

export function ChatInput() {
  const [text, setText] = useState('');
  const { isStreaming, sendMessage, stopGeneration } = useAIState();

  const submitMessage = async (): Promise<void> => {

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

    if (value.length === 0 || isStreaming) {
      return;
    }

    setText('');
    await sendMessage(value);
  };

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
        disabled={isStreaming}
        onChange={(event) => {
          setText(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            void submitMessage();
          }
        }}
        placeholder={isStreaming ? 'HANNA is responding...' : 'Ask HANNA anything...'}
        className={styles.input}
      />

      {isStreaming ? (
        <button type="button" onClick={stopGeneration} className={styles.stopButton}>
          Stop
        </button>
      ) : (
        <button type="button" onClick={() => void submitMessage()} className={styles.sendButton}>
          Send
        </button>
      )}

      <button onClick={() => void sendMessage()} className={styles.sendButton}>
        Send
      </button>
    </div>
  );
}
