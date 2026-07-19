import styles from "./RightPanel.module.css";

const metrics = [
    { label: "CPU", value: "3%" },
    { label: "RAM", value: "1.4 GB" },
    { label: "GPU", value: "Idle" },
    { label: "Network", value: "Online" },
    { label: "Latency", value: "24 ms" },
    { label: "Temperature", value: "41°C" }
];

export const RightPanel = () => {
    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <h2>System</h2>
            </div>

            <div className={styles.grid}>
                {metrics.map(metric => (
                    <div key={metric.label} className={styles.card}>
                        <span>{metric.label}</span>
                        <strong>{metric.value}</strong>
                    </div>
                ))}
            </div>
        </div>
    );
};
