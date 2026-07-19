import styles from "./ChatPanel.module.css";

const messages = [
    {
        id: 1,
        role: "assistant",
        text: "Hello! I'm HANNA. How can I help you today?"
    }
];

export function ChatPanel() {
    return (
        <section className={styles.panel}>
            <header className={styles.header}>
                <h2>Conversation</h2>
                <span>Ready</span>
            </header>

            <div className={styles.messages}>
                {messages.map(message => (
                    <div
                        key={message.id}
                        className={`${styles.message} ${message.role === "assistant" ? styles.assistant : styles.user}`}
                    >
                        <div className={styles.avatar}>
                            {message.role === "assistant" ? "H" : "U"}
                        </div>

                        <div className={styles.bubble}>
                            {message.text}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
