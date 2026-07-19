import styles from "./HannaLivePage.module.css";

import { LeftPanel } from "./components/LeftPanel/LeftPanel";
import { RightPanel } from "./components/RightPanel/RightPanel";
import { AvatarCore } from "./components/AvatarCore/AvatarCore";
import { VoiceBar } from "./components/VoiceBar/VoiceBar";

export function HannaLivePage() {    return (
        <div className={styles.page}>
            <aside className={styles.left}>
                <LeftPanel />
            </aside>

            <main className={styles.center}>
                <AvatarCore />

                <h1>Good Evening</h1>
                <p>I'm HANNA. Ready whenever you are.</p>

                <VoiceBar />
            </main>

            <aside className={styles.right}>
                <RightPanel />
            </aside>
        </div>
    );
}
