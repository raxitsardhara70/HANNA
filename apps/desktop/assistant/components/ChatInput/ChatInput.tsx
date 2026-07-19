import { useState } from "react";

import styles from "./ChatInput.module.css";

import { useAIState } from "../../state/useAIState";
import { simulateStreaming } from "../../utils/simulateStreaming";

export function ChatInput() {

    const [text, setText] = useState("");

    const {
        addMessage,
        updateMessage,
        setState,
    } = useAIState();

    async function sendMessage() {

        const value = text.trim();

        if (!value) return;

        addMessage({
            id: crypto.randomUUID(),
            role: "user",
            content: value,
            timestamp: Date.now(),
        });

        setText("");

        setState("thinking");

        await simulateStreaming(
            "Hello! I am HANNA. Streaming is working correctly.",
            addMessage,
            updateMessage,
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
                        sendMessage();
                    }
                }}
                placeholder="Ask HANNA anything..."
                className={styles.input}
            />

            <button
                onClick={sendMessage}
                className={styles.button}
            >
                Send
            </button>

        </div>

    );

}
