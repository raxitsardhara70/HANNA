import { createContext } from 'react';
import type { VoiceContextValue } from './VoiceTypes';

export const VoiceContext = createContext<VoiceContextValue | null>(null);
