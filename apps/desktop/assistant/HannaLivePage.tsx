import { LeftPanel } from "./components/LeftPanel/LeftPanel";
import { RightPanel } from "./components/RightPanel/RightPanel";
import { AvatarCore } from "./components/AvatarCore/AvatarCore";
import { VoiceBar } from "./components/VoiceBar/VoiceBar";
import styles from "./HannaLivePage.module.css";

export const HannaLivePage = () => {
    return (
        <section className={styles.page}>
            <div className={styles.background}></div>

            <aside className={styles.leftPanel}>
                <LeftPanel />
            </aside>

            <main className={styles.centerPanel}>

                <div className={styles.avatarSection}>
                    <AvatarCore />
                </div>

                <h1 className={styles.title}>
                    Good Afternoon
                </h1>

                <p className={styles.subtitle}>
                    At your service.
                </p>

            </main>

            <aside className={styles.rightPanel}>
                <RightPanel />
            </aside>

            <footer className={styles.bottomBar}>
                <VoiceBar />
            </footer>

        </section>
    );
};
