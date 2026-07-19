import styles from "./VoiceBar.module.css";

import { useAIState } from "../../state/useAIState";

export function VoiceBar() {

    const {
        state,
        isMuted,
    } = useAIState();

    const label = isMuted
        ? "Muted"
        : state.charAt(0).toUpperCase() + state.slice(1);

    return (
        <section className={styles.container}>

            <div className={styles.header}>
                <span>Voice Status</span>

                <span className={styles.status}>
                    {label}
                </span>
            </div>

            <div className={styles.wave}>
                <span />
                <span />
                <span />
                <span />
                <span />
            </div>

        </section>
    );
}
