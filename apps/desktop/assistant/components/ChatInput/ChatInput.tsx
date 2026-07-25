import { useEffect, useState } from 'react';

import { useAIState } from '../../state/useAIState';
import { useVoice } from '../../../voice/VoiceHooks';
import styles from './ChatInput.module.css';

export function ChatInput() {
  const [text, setText] = useState('');
  const { isStreaming, sendMessage, stopGeneration } = useAIState();
  const voice = useVoice();

  useEffect(() => {
    const transcript = voice.finalTranscript.trim();
    if (!voice.settings.autoSend && transcript.length > 0) {
      setText(transcript);
    }
  }, [voice.finalTranscript, voice.settings.autoSend]);

  const submitMessage = async (): Promise<void> => {
    const value = text.trim();

    if (value.length === 0 || isStreaming) {
      return;
    }

    setText('');
    voice.clearTranscript();
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
