import { createContext, useContext } from 'react';

import type { AssistantProvider } from './AssistantProvider';
import { ipcAssistantProvider } from './ipcAssistantProvider';
import { mockAssistantProvider } from './mockAssistantProvider';

const getDefaultAssistantProvider = (): AssistantProvider => {
  if (window.hanna?.assistant) {
    return ipcAssistantProvider;
  }

  return mockAssistantProvider;
};

export const AssistantProviderContext = createContext<AssistantProvider>(getDefaultAssistantProvider());

export function useAssistantProvider() {
  return useContext(AssistantProviderContext);
}
