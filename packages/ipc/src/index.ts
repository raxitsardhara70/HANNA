import type { AppMetadata, RuntimeConfig, SystemSnapshot } from '@hanna/types';

export const ipcChannels = {
  appGetConfig: 'app:get-config',
  appGetMetadata: 'app:get-metadata',
  appGetSystemSnapshot: 'app:get-system-snapshot',
} as const;

export interface IpcRequestMap {
  readonly [ipcChannels.appGetConfig]: {
    readonly response: RuntimeConfig;
  };
  readonly [ipcChannels.appGetMetadata]: {
    readonly response: AppMetadata;
  };
  readonly [ipcChannels.appGetSystemSnapshot]: {
    readonly response: SystemSnapshot;
  };
}

export type IpcChannel = keyof IpcRequestMap;
export type IpcResponse<TChannel extends IpcChannel> = IpcRequestMap[TChannel]['response'];
