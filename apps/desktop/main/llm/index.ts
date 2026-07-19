import { MockLlmProvider } from "./MockLlmProvider";
import type { LlmProvider } from "./LlmProvider";

let provider: LlmProvider = new MockLlmProvider();

export function getLlmProvider(): LlmProvider {
    return provider;
}

export function setLlmProvider(
    llmProvider: LlmProvider,
): void {
    provider = llmProvider;
}
