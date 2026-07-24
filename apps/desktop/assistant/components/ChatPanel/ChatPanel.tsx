import { useEffect, useMemo, useRef } from 'react';

import styles from './ChatPanel.module.css';

import { useAIState } from '../../state/useAIState';

export function ChatPanel() {
  const {
    copyResponse,
    isStreaming,
    messages,
    regenerateResponse,
    retryLastMessage,
    state,
  } = useAIState();
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastAssistantMessageId = useMemo(
    () => [...messages].reverse().find((message) => message.role === 'assistant')?.id ?? null,
    [messages],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: isStreaming ? 'auto' : 'smooth' });
  }, [isStreaming, messages]);

  return (
    <section className={styles.panel}>
      <header className={styles.header}>
        <div>
          <h2>Conversation</h2>
          <p>{isStreaming ? 'Streaming response token by token' : 'Ready for your next message'}</p>
        </div>

        <div className={styles.headerActions}>
          <button type="button" onClick={() => void retryLastMessage()} disabled={isStreaming || messages.length === 0}>
            Retry Last
          </button>
          <button type="button" onClick={() => void regenerateResponse()} disabled={isStreaming || lastAssistantMessageId === null}>
            Regenerate
          </button>
          <span>{state}</span>
        </div>
      </header>

      <div className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.empty}>
            <h3>Start a conversation</h3>
            <p>Ask HANNA anything. Streaming responses will appear here in real time.</p>
          </div>
        )}

        {messages.map((message) => {
          const isAssistant = message.role === 'assistant';
          return (
            <div
              key={message.id}
              className={classNames(styles.message, isAssistant ? styles.assistant : styles.user, message.error ? styles.error : undefined)}
            >
              <div className={styles.avatar}>{isAssistant ? 'H' : 'U'}</div>

              <div className={styles.messageBody}>
                <div className={styles.bubble}>
                  {message.content.length > 0 ? message.content : <span className={styles.cursor}>Thinking</span>}
                </div>

                <div className={styles.footer}>
                  <time dateTime={new Date(message.timestamp).toISOString()}>
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                  {message.streaming === true && <span className={styles.streaming}>Streaming...</span>}
                  {isAssistant && message.content.length > 0 && (
                    <button type="button" onClick={() => void copyResponse(message.id)}>
                      Copy
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>
    </section>
  );
}

function classNames(...names: readonly (string | undefined)[]): string {
  return names.filter((name): name is string => name !== undefined).join(' ');
}
