import {
    createContext,
    useContext,
} from "react";

import type { AssistantProvider } from "./AssistantProvider";
import { ipcAssistantProvider } from "./ipcAssistantProvider";

export const AssistantProviderContext =
    createContext<AssistantProvider>(
        ipcAssistantProvider,
    );

export function useAssistantProvider() {
    return useContext(
        AssistantProviderContext,
    );
}

