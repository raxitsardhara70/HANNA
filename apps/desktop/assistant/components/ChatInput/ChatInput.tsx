import { useState } from 'react';

import styles from './ChatInput.module.css';

import { useAIState } from '../../state/useAIState';

export function ChatInput() {
  const [text, setText] = useState('');
  const { isStreaming, sendMessage, stopGeneration } = useAIState();

  const submitMessage = async (): Promise<void> => {
    const value = text.trim();

    if (value.length === 0 || isStreaming) {
      return;
    }

    setText('');
    await sendMessage(value);
  };

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
    </div>
  );
}
