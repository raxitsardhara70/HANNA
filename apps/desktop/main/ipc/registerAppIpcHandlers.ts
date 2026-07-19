import { app, ipcMain } from "electron";
import { ipcChannels } from "@hanna/ipc";
import { appMetadata } from "@hanna/shared";
import { generateAssistantResponse } from "../assistant/generateAssistantResponse";
import type {
    RuntimeConfig,
    SystemSnapshot,
} from "@hanna/types";

export const registerAppIpcHandlers = (config: RuntimeConfig): void => {

    ipcMain.handle(
        ipcChannels.appGetMetadata,
        () => appMetadata,
    );

    ipcMain.handle(
        ipcChannels.appGetConfig,
        () => config,
    );

    ipcMain.handle(
        ipcChannels.appGetSystemSnapshot,
        (): SystemSnapshot => ({
            arch: process.arch,
            electronVersion: process.versions.electron,
            nodeVersion: process.versions.node,
            platform: process.platform,
        }),
    );

    ipcMain.handle(
        ipcChannels.assistantSendMessage,
        async (_event, message: string) => ({
            text: await generateAssistantResponse(message),
        }),
    );

    app.on("before-quit", () => {
        ipcMain.removeHandler(ipcChannels.appGetMetadata);
        ipcMain.removeHandler(ipcChannels.appGetConfig);
        ipcMain.removeHandler(ipcChannels.appGetSystemSnapshot);
        ipcMain.removeHandler(ipcChannels.assistantSendMessage);
    });

};
