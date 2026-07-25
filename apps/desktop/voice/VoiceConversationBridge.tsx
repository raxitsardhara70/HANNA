import { useEffect, useRef } from 'react';
import { useAIState } from '../assistant/state/useAIState';
import { useVoice } from './VoiceHooks';

export function VoiceConversationBridge() {
  const voice = useVoice();
  const { isStreaming, sendMessage } = useAIState();
  const lastSubmittedTranscriptRef = useRef('');

  useEffect(() => {
    const transcript = voice.finalTranscript.trim();
    if (transcript.length === 0 || transcript === lastSubmittedTranscriptRef.current) return;
    lastSubmittedTranscriptRef.current = transcript;
    if (voice.settings.autoSend && !isStreaming) {
      void sendMessage(transcript).then(() => {
        voice.clearTranscript();
      });
    }
  }, [isStreaming, sendMessage, voice]);

  return null;
}
