import type { CSSProperties } from 'react';
import { useVoice } from '../../../voice/VoiceHooks';
import styles from './VoiceBar.module.css';

const visibleStates = new Set(['idle', 'listening', 'processing', 'speaking', 'muted', 'error']);
const labelFor = (state: string): string => visibleStates.has(state) ? state.replace(/^./, (char) => char.toUpperCase()) : 'Idle';

export function VoiceBar() {
  const voice = useVoice();
  const bars = [0.35, 0.55, 0.75, 1, 0.75, 0.55, 0.35];
  const level = voice.state === 'listening' ? voice.audioLevel : 0;

  return (
    <section className={styles.container} data-state={voice.state}>
      <div className={styles.header}>
        <span>Voice Status</span>
        <span className={styles.status}>{voice.settings.muted ? 'Muted' : labelFor(voice.state)}</span>
      </div>

      <div className={styles.meter} aria-label={`Microphone level ${String(Math.round(level * 100))} percent`}>
        {bars.map((weight, index) => (
          <span key={weight + index} style={{ '--bar-height': `${String(10 + level * weight * 38)}px` } as CSSProperties} />
        ))}
      </div>

      <div className={styles.transcript}>
        {voice.partialTranscript || voice.finalTranscript || 'Speech transcript will appear here.'}
      </div>

      <div className={styles.controls}>
        <label>
          Language
          <input value={voice.speechRecognition.settings.language} onChange={(event) => { void voice.updateSettings({ language: event.target.value }); }} />
        </label>
        <label>
          <input type="checkbox" checked={voice.settings.autoSend} onChange={(event) => { void voice.updateSettings({ autoSend: event.target.checked }); }} />
          Auto Send
        </label>
        <label>
          <input type="checkbox" checked={voice.speechRecognition.settings.continuous} onChange={(event) => { void voice.updateSettings({ continuousMode: event.target.checked }); }} />
          Continuous
        </label>
      </div>

      <div className={styles.meta}>
        <span>Permission: {voice.permission}</span>
        <span>Recognition: {voice.speechRecognition.state}</span>
        <span>Confidence: {String(Math.round(voice.speechRecognition.confidence * 100))}%</span>
        <span>Device: {voice.devices.find((device) => device.deviceId === voice.settings.inputDeviceId)?.label ?? voice.devices[0]?.label ?? 'Unavailable'}</span>
      </div>
    </section>
  );
}
