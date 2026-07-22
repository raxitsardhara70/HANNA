import type {
  AppMetadata,
  RuntimeConfig,
  SystemSnapshot,
  AssistantResponse,
  AssistantStreamEvent,
  AssistantStreamRequest,
} from '@hanna/types';

export const ipcChannels = {
  appGetConfig: 'app:get-config',
  appGetMetadata: 'app:get-metadata',
  appGetSystemSnapshot: 'app:get-system-snapshot',
  assistantSendMessage: 'assistant:send-message',
  assistantStartStream: 'assistant:start-stream',
  assistantStreamEvent: 'assistant:stream-event',
  assistantCancelStream: 'assistant:cancel-stream',
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

  readonly [ipcChannels.assistantSendMessage]: {
    readonly request: string;
    readonly response: AssistantResponse;
  };

  readonly [ipcChannels.assistantStartStream]: {
    readonly request: AssistantStreamRequest;
    readonly response: null;
  };

  readonly [ipcChannels.assistantStreamEvent]: {
    readonly response: AssistantStreamEvent;
  };

  readonly [ipcChannels.assistantCancelStream]: {
    readonly request: string;
    readonly response: null;
  };
}

export type IpcChannel = keyof IpcRequestMap;

export type IpcResponse<TChannel extends IpcChannel> = IpcRequestMap[TChannel]['response'];
