import { useState } from "react";

import styles from "./ChatInput.module.css";

import { useAIState } from "../../state/useAIState";
import { useAssistantProvider } from "../../providers/useAssistantProvider";

export function ChatInput() {

    const [text, setText] = useState("");

    const {
        addMessage,
        updateMessage,
        setState,
    } = useAIState();

    const provider = useAssistantProvider();

    async function sendMessage() {

        const value = text.trim();

        if (!value) return;

        setText("");

        setState("thinking");

        await provider.sendUserMessage(
            value,
            {
                onUserMessage: addMessage,
                onAssistantMessage: addMessage,
                onAssistantUpdate: updateMessage,
            },
        );

        setState("ready");

    }

    return (

        <div className={styles.container}>

            <input
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => {
                    if (e.key === "Enter") {
                        void sendMessage();
                    }
                }}
                placeholder="Ask HANNA anything..."
                className={styles.input}
            />

            <button
                onClick={() => void sendMessage()}
                className={styles.button}
            >
                Send
            </button>

        </div>

    );

}
