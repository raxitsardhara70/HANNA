import { useCallback, useMemo, useState, type PropsWithChildren } from 'react';

import { initialAssistantState } from './AIState';
import { AIStateContext } from './AIStateContextValue';

import type { AIState, AssistantContextValue, ChatMessage } from '../types/assistant';

export function AIStateProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AIState>(initialAssistantState.state);

  const [messages, setMessages] = useState(initialAssistantState.messages);

  const [isMuted, setMuted] = useState(initialAssistantState.isMuted);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((previous) => [...previous, message]);
  }, []);

  const appendToMessage = useCallback((id: string, chunk: string) => {
    setMessages((previous) =>
      previous.map((message) =>
        message.id === id
          ? {
              ...message,
              content: `${message.content}${chunk}`,
              streaming: true,
            }
          : message,
      ),
    );
  }, []);


  const updateMessage = useCallback((id: string, content: string, streaming = false) => {
    setMessages((previous) =>
      previous.map((message) =>
        message.id === id
          ? {
              ...message,
              content,
              streaming,
            }
          : message,
      ),
    );
  }, []);

  const finalizeMessage = useCallback((id: string) => {
    setMessages((previous) =>
      previous.map((message) =>
        message.id === id
          ? {
              ...message,
              streaming: false,
            }
          : message,
      ),
    );
  }, []);

  const markMessageError = useCallback((id: string, content: string) => {
    setMessages((previous) =>
      previous.map((message) =>
        message.id === id
          ? {
              ...message,
              content,
              error: true,
              streaming: false,
            }
          : message,
      ),
    );
  }, []);



  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const value = useMemo<AssistantContextValue>(
    () => ({
      state,
      messages,
      isMuted,
      setState,
      setMuted,
      addMessage,
      appendToMessage,
      updateMessage,
      finalizeMessage,
      markMessageError,
      clearMessages,
    }),
    [
      state,
      messages,
      isMuted,
      addMessage,
      appendToMessage,
      updateMessage,
      finalizeMessage,
      markMessageError,
      clearMessages,
    ],

      updateMessage,
      clearMessages,
    }),
    [state, messages, isMuted, addMessage, updateMessage, clearMessages],
  );

  return <AIStateContext.Provider value={value}>{children}</AIStateContext.Provider>;
}
