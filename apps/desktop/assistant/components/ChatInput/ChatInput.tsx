import { useRef, useState } from 'react';
=======
import { useState } from 'react';

import styles from './ChatInput.module.css';

import { useAIState } from '../../state/useAIState';
import { useAssistantProvider } from '../../providers/useAssistantProvider';

export function ChatInput() {
  const [text, setText] = useState('');
  const activeRequestRef = useRef<AbortController | null>(null);

  const {
    addMessage,
    appendToMessage,
    finalizeMessage,
    markMessageError,
    setState,
  } = useAIState();


  const { addMessage, updateMessage, setState } = useAIState();

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
        setState('ready');
      }
    } catch {
      setState('error');
    } finally {
      activeRequestRef.current = null;
    }

    if (!value) return;

    setText('');

    setState('thinking');

    await provider.sendUserMessage(value, {
      onUserMessage: addMessage,
      onAssistantMessage: addMessage,
      onAssistantUpdate: updateMessage,
    });

    setState('ready');
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

      <button onClick={() => void sendMessage()} className={styles.button}>
        Send
      </button>
    </div>
  );
}
