import styles from "./HannaLivePage.module.css";

import { AIStateProvider } from "./state/AIStateContext";

import { LeftPanel } from "./components/LeftPanel/LeftPanel";
import { RightPanel } from "./components/RightPanel/RightPanel";
import { AvatarCore } from "./components/AvatarCore/AvatarCore";
import { VoiceBar } from "./components/VoiceBar/VoiceBar";
import { ChatPanel } from "./components/ChatPanel/ChatPanel";
import { ChatInput } from "./components/ChatInput/ChatInput";
import { MicButton } from "./components/MicButton/MicButton";

export function HannaLivePage() {
    return (
        <AIStateProvider>
            <div className={styles.page}>
                <aside className={styles.leftPanel}>
                    <LeftPanel />
                </aside>

                <main className={styles.centerPanel}>
                    <AvatarCore />

                    <h1 className={styles.title}>
                        Good Evening
                    </h1>

                    <p className={styles.subtitle}>
                        I'm HANNA. Ready whenever you are.
                    </p>

                    <VoiceBar />

                    <ChatPanel />
                </main>

                <aside className={styles.rightPanel}>
                    <MicButton />

                    <RightPanel />
                </aside>

                <footer className={styles.bottomBar}>
                    <ChatInput />
                </footer>
            </div>
        </AIStateProvider>
    );
}
