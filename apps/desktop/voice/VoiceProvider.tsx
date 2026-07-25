import { useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { VoiceContext } from './VoiceContext';
import { VoiceService } from './VoiceService';
import { createInitialVoiceSnapshot } from './VoiceState';
import { defaultVoiceSettings } from './VoiceSettings';
import type { VoiceContextValue, VoiceSettings, VoiceSnapshot } from './VoiceTypes';

export function VoiceProvider({ children }: PropsWithChildren) {
  const serviceRef = useRef<VoiceService | null>(null);
  const [snapshot, setSnapshot] = useState<VoiceSnapshot>(() => createInitialVoiceSnapshot(defaultVoiceSettings));

  serviceRef.current ??= new VoiceService();

  const refresh = useCallback((): Promise<void> => {
    const service = serviceRef.current;
    if (service !== null) setSnapshot(service.getSnapshot());
    return Promise.resolve();
  }, []);

  useEffect(() => {
    const service = serviceRef.current;
    if (service === null) return undefined;
    let mounted = true;
    const unsubscribe = service.subscribe(() => {
      if (mounted) setSnapshot(service.getSnapshot());
    });
    void service.initialize().then((next) => {
      if (mounted) setSnapshot(next);
    });
    return () => {
      mounted = false;
      unsubscribe();
      service.dispose();
      serviceRef.current = null;
    };
  }, []);

  const updateSettings = useCallback(async (settings: Partial<VoiceSettings>) => serviceRef.current?.updateSettings(settings), []);

  const value = useMemo<VoiceContextValue>(() => ({
    ...snapshot,
    cancelListening: async () => serviceRef.current?.cancel(),
    clearTranscript: () => { serviceRef.current?.clearTranscript(); setSnapshot(serviceRef.current?.getSnapshot() ?? snapshot); },
    finalTranscript: snapshot.speechRecognition.finalTranscript,
    mute: async () => updateSettings({ muted: true }),
    refresh,
    partialTranscript: snapshot.speechRecognition.partialTranscript,
    requestPermission: async () => serviceRef.current?.requestPermission(),
    revokePermission: async () => serviceRef.current?.revokePermission(),
    startListening: async () => serviceRef.current?.start(),
    stopListening: async () => serviceRef.current?.stop(),
    toggleListening: async () => serviceRef.current?.toggle(),
    unmute: async () => updateSettings({ muted: false }),
    updateSettings,
  }), [refresh, snapshot, updateSettings]);

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
}
