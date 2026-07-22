import { useRef, useState } from 'react';

import styles from './ChatInput.module.css';

import { useAIState } from '../../state/useAIState';
import { useAssistantProvider } from '../../providers/useAssistantProvider';

export function ChatInput() {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const activeRequestRef = useRef<AbortController | null>(null);

  const {
    addMessage,
    appendToMessage,
    finalizeMessage,
    markMessageError,
    setState,
  } = useAIState();

  const provider = useAssistantProvider();

  async function sendMessage() {
    const value = text.trim();

    if (!value || isSending || activeRequestRef.current !== null) return;

    const abortController = new AbortController();
    activeRequestRef.current = abortController;

    setText('');
    setIsSending(true);
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
      setIsSending(false);
    }
  }

  return (
    <div className={styles.container}>
      <input
        value={text}
        disabled={isSending}
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

      <button onClick={() => void sendMessage()} className={styles.button} disabled={isSending}>
        Send
      </button>
    </div>
  );
}
