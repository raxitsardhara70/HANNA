import styles from "./ChatInput.module.css";

export function ChatInput() {
    return (
        <footer className={styles.container}>
            <button className={styles.iconButton} aria-label="Attach file">
                +
            </button>

            <textarea
                className={styles.input}
                placeholder="Message HANNA..."
                rows={1}
            />

            <button className={styles.clearButton}>
                Clear
            </button>

            <button className={styles.sendButton}>
                Send
            </button>
        </footer>
    );
}
