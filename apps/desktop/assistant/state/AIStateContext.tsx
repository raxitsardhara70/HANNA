import { useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import type { ConversationSnapshot } from '@hanna/types';

import { useAssistantProvider } from '../providers/useAssistantProvider';
import {
  conversationToMessages,
  conversationToSummary,
  type AIState,
  type AssistantContextValue,
  type ChatMessage,
  type ConversationSummary,
} from '../types/assistant';
import { initialAssistantState } from './AIState';
import { AIStateContext } from './AIStateContextValue';

function findActiveMessages(snapshot: ConversationSnapshot): ChatMessage[] {
  const activeConversation = snapshot.conversations.find((conversation) => conversation.id === snapshot.activeConversationId);
  return conversationToMessages(activeConversation);
}

function toSummaries(snapshot: ConversationSnapshot): ConversationSummary[] {
  return snapshot.conversations.map(conversationToSummary);
}

function findLastUserMessage(messages: readonly ChatMessage[]): ChatMessage | null {
  return [...messages].reverse().find((message) => message.role === 'user') ?? null;
}

export function AIStateProvider({ children }: PropsWithChildren) {
  const provider = useAssistantProvider();
  const activeRequestRef = useRef<AbortController | null>(null);
  const stateRevisionRef = useRef(0);
  const [state, setState] = useState<AIState>(initialAssistantState.state);
  const [conversations, setConversations] = useState<ConversationSummary[]>(initialAssistantState.conversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialAssistantState.activeConversationId);
  const [messages, setMessages] = useState<ChatMessage[]>(initialAssistantState.messages);
  const [isMuted, setMuted] = useState(initialAssistantState.isMuted);
  const [isStreaming, setStreaming] = useState(initialAssistantState.isStreaming);

  const applySnapshot = useCallback((snapshot: ConversationSnapshot) => {
    setConversations(toSummaries(snapshot));
    setActiveConversationId(snapshot.activeConversationId);
    setMessages(findActiveMessages(snapshot));
  }, []);

  const loadConversations = useCallback(async () => {
    const revision = stateRevisionRef.current;
    setState('loading');
    try {
      const snapshot = await provider.listConversations();

      if (revision === stateRevisionRef.current) {
        applySnapshot(snapshot);
        setState('ready');
      }
    } catch {
      if (revision === stateRevisionRef.current) {
        setState('error');
      }
    }
  }, [applySnapshot, provider]);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  const createConversation = useCallback(async () => {
    stateRevisionRef.current += 1;
    activeRequestRef.current?.abort();
    activeRequestRef.current = null;
    applySnapshot(await provider.createConversation());
  }, [applySnapshot, provider]);

  const selectConversation = useCallback(async (conversationId: string) => {
    stateRevisionRef.current += 1;
    applySnapshot(await provider.selectConversation(conversationId));
  }, [applySnapshot, provider]);

  const renameConversation = useCallback(async (conversationId: string, title: string) => {
    stateRevisionRef.current += 1;
    applySnapshot(await provider.renameConversation(conversationId, title));
  }, [applySnapshot, provider]);

  const deleteConversation = useCallback(async (conversationId: string) => {
    stateRevisionRef.current += 1;

    if (conversationId === activeConversationId) {
      activeRequestRef.current?.abort();
      activeRequestRef.current = null;
    }

    applySnapshot(await provider.deleteConversation(conversationId));
  }, [activeConversationId, applySnapshot, provider]);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((previous) => [...previous, message]);
  }, []);

  const appendToMessage = useCallback((id: string, chunk: string) => {
    setMessages((previous) => previous.map((message) => message.id === id ? { ...message, content: `${message.content}${chunk}`, streaming: true } : message));
  }, []);

  const updateMessage = useCallback((id: string, content: string, streaming = false) => {
    setMessages((previous) => previous.map((message) => message.id === id ? { ...message, content, streaming } : message));
  }, []);

  const finalizeMessage = useCallback((id: string) => {
    setMessages((previous) => previous.map((message) => message.id === id ? { ...message, streaming: false } : message));
  }, []);

  const markMessageError = useCallback((id: string, content: string) => {
    setMessages((previous) => previous.map((message) => message.id === id ? { ...message, content, error: true, streaming: false } : message));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const normalizedText = text.trim();

    if (normalizedText.length === 0 || activeRequestRef.current !== null) {
      return;
    }

    stateRevisionRef.current += 1;
    const requestRevision = stateRevisionRef.current;
    const abortController = new AbortController();
    activeRequestRef.current = abortController;
    setStreaming(true);
    setState('thinking');

    try {
      await provider.sendUserMessage({
        conversationId: activeConversationId,
        text: normalizedText,
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
        const snapshot = await provider.listConversations();

        if (requestRevision === stateRevisionRef.current) {
          applySnapshot(snapshot);
          setState('ready');
        }
      }
    } catch {
      setState('error');
    } finally {
      activeRequestRef.current = null;
      setStreaming(false);
    }
  }, [activeConversationId, addMessage, appendToMessage, applySnapshot, finalizeMessage, markMessageError, provider]);

  const stopGeneration = useCallback(() => {
    activeRequestRef.current?.abort();
    activeRequestRef.current = null;
    setStreaming(false);
    setState('ready');
  }, []);

  const retryLastMessage = useCallback(async () => {
    const lastUserMessage = findLastUserMessage(messages);

    if (lastUserMessage !== null) {
      await sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  const regenerateResponse = useCallback(async () => {
    const lastUserMessage = findLastUserMessage(messages);

    if (lastUserMessage !== null) {
      await sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  const copyResponse = useCallback(async (messageId: string) => {
    const message = messages.find((candidate) => candidate.id === messageId);

    if (message?.role === 'assistant' && message.content.length > 0) {
      await navigator.clipboard.writeText(message.content);
    }
  }, [messages]);

  const value = useMemo<AssistantContextValue>(() => ({
    state,
    conversations,
    activeConversationId,
    messages,
    isMuted,
    isStreaming,
    setState,
    setMuted,
    loadConversations,
    createConversation,
    selectConversation,
    renameConversation,
    deleteConversation,
    sendMessage,
    stopGeneration,
    retryLastMessage,
    regenerateResponse,
    copyResponse,
    addMessage,
    appendToMessage,
    updateMessage,
    finalizeMessage,
    markMessageError,
    clearMessages,
  }), [state, conversations, activeConversationId, messages, isMuted, isStreaming, loadConversations, createConversation, selectConversation, renameConversation, deleteConversation, sendMessage, stopGeneration, retryLastMessage, regenerateResponse, copyResponse, addMessage, appendToMessage, updateMessage, finalizeMessage, markMessageError, clearMessages]);

  return <AIStateContext.Provider value={value}>{children}</AIStateContext.Provider>;
}
