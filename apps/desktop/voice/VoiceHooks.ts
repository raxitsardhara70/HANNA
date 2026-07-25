import { useContext } from 'react';
import { VoiceContext } from './VoiceContext';
import type { VoiceContextValue } from './VoiceTypes';

export const useVoice = (): VoiceContextValue => {
  const context = useContext(VoiceContext);
  if (context === null) throw new Error('useVoice must be used within VoiceProvider.');
  return context;
};
