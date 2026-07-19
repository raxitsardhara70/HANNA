export interface ConversationMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export class ConversationMemory {

    private readonly messages: ConversationMessage[] = [];

    addUserMessage(content: string): void {
        this.messages.push({
            role: "user",
            content,
        });
    }

    addAssistantMessage(content: string): void {
        this.messages.push({
            role: "assistant",
            content,
        });
    }

    getMessages(): readonly ConversationMessage[] {
        return this.messages;
    }

    clear(): void {
        this.messages.length = 0;
    }

}
