import { useEffect, useRef } from "react";

import styles from "./ChatPanel.module.css";

import { useAIState } from "../../state/useAIState";

export function ChatPanel() {

    const {
        messages,
        state,
    } = useAIState();

    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);

    return (
        <section className={styles.panel}>

            <header className={styles.header}>

                <h2>Conversation</h2>

                <span>{state}</span>

            </header>

            <div className={styles.messages}>

                {messages.length === 0 && (

                    <div className={styles.empty}>

                        <h3>Start a conversation</h3>

                        <p>
                            Ask HANNA anything.
                        </p>

                    </div>

                )}

                {messages.map(message => (

                    <div
                        key={message.id}
                        className={`${styles.message} ${
                            message.role === "assistant"
                                ? styles.assistant
                                : styles.user
                        }`}
                    >

                        <div className={styles.avatar}>
                            {message.role === "assistant" ? "H" : "U"}
                        </div>

                        <div>

                            <div className={styles.bubble}>
                                {message.content}
                            </div>

                            <div className={styles.time}>
                                {new Date(
                                    message.timestamp
                                ).toLocaleTimeString([],{
                                    hour:"2-digit",
                                    minute:"2-digit"
                                })}
                            </div>

                        </div>

                    </div>

                ))}

                <div ref={bottomRef} />

            </div>

        </section>
    );
}
