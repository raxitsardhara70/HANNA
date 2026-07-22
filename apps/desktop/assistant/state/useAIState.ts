import { useContext } from 'react';

import { AIStateContext } from './AIStateContextValue';

export function useAIState() {
  const context = useContext(AIStateContext);

  if (!context) {
    throw new Error('useAIState must be used within AIStateProvider.');
  }

  return context;
}
