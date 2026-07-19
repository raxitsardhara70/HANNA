import {
    createContext,
    useContext,
} from "react";

import type { AssistantProvider } from "./AssistantProvider";
import { mockAssistantProvider } from "./mockAssistantProvider";

export const AssistantProviderContext =
    createContext<AssistantProvider>(
        mockAssistantProvider,
    );

export function useAssistantProvider() {
    return useContext(
        AssistantProviderContext,
    );
}
