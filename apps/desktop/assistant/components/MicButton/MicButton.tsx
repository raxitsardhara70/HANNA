import styles from "./MicButton.module.css";

export type MicState =
    | "idle"
    | "listening"
    | "thinking"
    | "speaking";

interface MicButtonProps {
    state?: MicState;
    muted?: boolean;
}

export function MicButton({
    state = "idle",
    muted = false,
}: MicButtonProps) {
    return (
        <button
            className={`${styles.button} ${styles[state]}`}
            aria-label="Microphone"
            aria-pressed={state !== "idle"}
        >
            <div className={styles.wave}>
                <span />
                <span />
                <span />
            </div>

            <div className={styles.icon}>
                {muted ? "??" : "??"}
            </div>

            <span className={styles.label}>
                {muted ? "Muted" : state}
            </span>
        </button>
    );
}
