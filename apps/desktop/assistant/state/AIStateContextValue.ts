import { createContext } from 'react';

import type { AssistantContextValue } from '../types/assistant';

export const AIStateContext = createContext<AssistantContextValue | null>(null);
