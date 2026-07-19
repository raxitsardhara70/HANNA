import styles from "./VoiceBar.module.css";

export const VoiceBar = () => {
    return (
        <div className={styles.container}>
            <button className={styles.button}>??</button>

            <div className={styles.wave}>
                {Array.from({ length: 32 }).map((_, i) => (
                    <span
                        key={i}
                        className={styles.bar}
                        style={{ animationDelay: `${i * 0.05}s` }}
                    />
                ))}
            </div>

            <button className={styles.button}>?</button>
        </div>
    );
};
