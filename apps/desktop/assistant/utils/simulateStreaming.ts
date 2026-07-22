import type { ChatMessage } from "../types/assistant";

export async function simulateStreaming(
    text: string,
    onStart: (message: ChatMessage) => void,
    onUpdate: (
        id: string,
        content: string,
        streaming: boolean,
    ) => void,
) {

    const id = crypto.randomUUID();

    onStart({
        id,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        streaming: true,
    });

    let current = "";

    for (const character of text) {

        current += character;

        onUpdate(
            id,
            current,
            true,
        );

        await new Promise(resolve =>
            setTimeout(resolve, 18),
        );

    }

    onUpdate(
        id,
        current,
        false,
    );

}
