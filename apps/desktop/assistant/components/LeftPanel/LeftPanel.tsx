import styles from "./LeftPanel.module.css";

const items = [
    { title: "Assistant", value: "Offline" },
    { title: "Voice Engine", value: "Ready" },
    { title: "Camera", value: "Idle" },
    { title: "Screen Share", value: "Disconnected" },
    { title: "Memory", value: "Available" },
    { title: "Reasoning", value: "Standby" }
];

export const LeftPanel = () => {
    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <h2>Activity</h2>
                <span>LIVE</span>
            </div>

            <div className={styles.list}>
                {items.map(item => (
                    <div key={item.title} className={styles.card}>
                        <div>
                            <h4>{item.title}</h4>
                            <p>{item.value}</p>
                        </div>

                        <div className={styles.dot}></div>
                    </div>
                ))}
            </div>
        </div>
    );
};
