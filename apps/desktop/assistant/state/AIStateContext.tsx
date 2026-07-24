import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import type { ConversationSnapshot } from '@hanna/types';

import { useAssistantProvider } from '../providers/useAssistantProvider';
import { conversationToMessages, conversationToSummary, type AIState, type AssistantContextValue, type ChatMessage, type ConversationSummary } from '../types/assistant';
import { initialAssistantState } from './AIState';
import { AIStateContext } from './AIStateContextValue';

function findActiveMessages(snapshot: ConversationSnapshot): ChatMessage[] {
  const activeConversation = snapshot.conversations.find((conversation) => conversation.id === snapshot.activeConversationId);
  return conversationToMessages(activeConversation);
}

function toSummaries(snapshot: ConversationSnapshot): ConversationSummary[] {
  return snapshot.conversations.map(conversationToSummary);
}

export function AIStateProvider({ children }: PropsWithChildren) {
  const provider = useAssistantProvider();
  const [state, setState] = useState<AIState>(initialAssistantState.state);
  const [conversations, setConversations] = useState<ConversationSummary[]>(initialAssistantState.conversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialAssistantState.activeConversationId);
  const [messages, setMessages] = useState<ChatMessage[]>(initialAssistantState.messages);
  const [isMuted, setMuted] = useState(initialAssistantState.isMuted);

  const applySnapshot = useCallback((snapshot: ConversationSnapshot) => {
    setConversations(toSummaries(snapshot));
    setActiveConversationId(snapshot.activeConversationId);
    setMessages(findActiveMessages(snapshot));
  }, []);

  const loadConversations = useCallback(async () => {
    setState('loading');
    try {
      applySnapshot(await provider.listConversations());
      setState('ready');
    } catch {
      setState('error');
    }
  }, [applySnapshot, provider]);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  const createConversation = useCallback(async () => {
    applySnapshot(await provider.createConversation());
  }, [applySnapshot, provider]);

  const selectConversation = useCallback(async (conversationId: string) => {
    applySnapshot(await provider.selectConversation(conversationId));
  }, [applySnapshot, provider]);

  const renameConversation = useCallback(async (conversationId: string, title: string) => {
    applySnapshot(await provider.renameConversation(conversationId, title));
  }, [applySnapshot, provider]);

  const deleteConversation = useCallback(async (conversationId: string) => {
    applySnapshot(await provider.deleteConversation(conversationId));
  }, [applySnapshot, provider]);

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

  const value = useMemo<AssistantContextValue>(() => ({
    state,
    conversations,
    activeConversationId,
    messages,
    isMuted,
    setState,
    setMuted,
    loadConversations,
    createConversation,
    selectConversation,
    renameConversation,
    deleteConversation,
    addMessage,
    appendToMessage,
    updateMessage,
    finalizeMessage,
    markMessageError,
    clearMessages,
  }), [state, conversations, activeConversationId, messages, isMuted, loadConversations, createConversation, selectConversation, renameConversation, deleteConversation, addMessage, appendToMessage, updateMessage, finalizeMessage, markMessageError, clearMessages]);

  return <AIStateContext.Provider value={value}>{children}</AIStateContext.Provider>;
}
