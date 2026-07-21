import { MockLlmProvider } from "./MockLlmProvider.js";
import type { LlmProvider } from "./LlmProvider.js";

let provider: LlmProvider = new MockLlmProvider();

export function getLlmProvider(): LlmProvider {
    return provider;
}

export function setLlmProvider(
    llmProvider: LlmProvider,
): void {
    provider = llmProvider;
}

