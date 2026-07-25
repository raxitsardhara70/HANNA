import type { CSSProperties } from 'react';
import { useVoice } from '../../../voice/VoiceHooks';
import styles from './MicButton.module.css';

const stateLabel = (state: string): string => state.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());

export function MicButton() {
  const voice = useVoice();
  const disabled = voice.state === 'requestingPermission' || voice.state === 'disabled';

  return (
    <div className={styles.panel}>
      <button
        className={styles.button}
        data-state={voice.state}
        disabled={disabled}
        onClick={() => { void voice.toggleListening(); }}
        aria-label={voice.state === 'listening' ? 'Stop listening' : 'Start listening'}
        aria-pressed={voice.state === 'listening'}
        type="button"
      >
        <div className={styles.levelRing} style={{ '--voice-level': String(Math.max(0.08, voice.audioLevel)) } as CSSProperties} />
        <div className={styles.icon}>{voice.settings.muted ? '🔇' : '🎙️'}</div>
        <span className={styles.label}>{voice.settings.muted ? 'Muted' : stateLabel(voice.state)}</span>
      </button>

      <div className={styles.actions}>
        <button type="button" onClick={() => { void (voice.permission === 'granted' ? voice.revokePermission() : voice.requestPermission()); }}>
          {voice.permission === 'granted' ? 'Revoke' : 'Grant'}
        </button>
        <button type="button" onClick={() => { void (voice.settings.muted ? voice.unmute() : voice.mute()); }}>
          {voice.settings.muted ? 'Unmute' : 'Mute'}
        </button>
        <button type="button" onClick={() => { void voice.cancelListening(); }}>Cancel</button>
      </div>

      {voice.error !== null && <p className={styles.error}>{voice.error.message}</p>}
    </div>
  );
}
