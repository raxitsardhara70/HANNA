import styles from "./LeftPanel.module.css";

export function LeftPanel() {
    return (
        <aside className={styles.container}>

            <section className={styles.card}>
                <h3>Activity</h3>

                <div className={styles.timeline}>

                    <div className={styles.item}>
                        <span className={styles.dot} />
                        Waiting for voice input...
                    </div>

                    <div className={styles.item}>
                        <span className={styles.dot} />
                        Conversation initialized
                    </div>

                </div>
            </section>

            <section className={styles.card}>
                <h3>Recent Sessions</h3>

                <div className={styles.session}>
                    New Conversation
                </div>

            </section>

        </aside>
    );
}
