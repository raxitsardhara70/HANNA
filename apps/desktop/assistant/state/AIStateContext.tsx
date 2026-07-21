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
      updateMessage,
      clearMessages,
    }),
    [state, messages, isMuted, addMessage, updateMessage, clearMessages],
  );

  return <AIStateContext.Provider value={value}>{children}</AIStateContext.Provider>;
}
