import styles from "./AvatarCore.module.css";

export const AvatarCore = () => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.outerRing}></div>
            <div className={styles.middleRing}></div>
            <div className={styles.innerRing}></div>

            <div className={styles.core}>
                <span>HANNA</span>
            </div>

            <div className={styles.glow}></div>
        </div>
    );
};
