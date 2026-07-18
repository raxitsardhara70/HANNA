import { createContext } from 'react';
import type { AppBootstrapState } from '@desktop/types/runtime';

export const AppRuntimeContext = createContext<AppBootstrapState | null>(null);
