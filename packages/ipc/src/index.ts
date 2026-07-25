import type {
  AppMetadata,
  RuntimeConfig,
  SystemSnapshot,
  AssistantResponse,
  AssistantMessageRequest,
  AssistantStreamEvent,
  AssistantStreamRequest,
  ConversationSnapshot,
  RenameConversationRequest,
  VoiceNativeDeviceSnapshot,
  VoiceNativePermissionSnapshot,
} from '@hanna/types';

export const ipcChannels = {
  appGetConfig: 'app:get-config',
  appGetMetadata: 'app:get-metadata',
  appGetSystemSnapshot: 'app:get-system-snapshot',
  assistantSendMessage: 'assistant:send-message',
  assistantStartStream: 'assistant:start-stream',
  assistantStreamEvent: 'assistant:stream-event',
  assistantCancelStream: 'assistant:cancel-stream',
  conversationList: 'conversation:list',
  conversationCreate: 'conversation:create',
  conversationSelect: 'conversation:select',
  conversationRename: 'conversation:rename',
  conversationDelete: 'conversation:delete',
  voiceGetPermissionSnapshot: 'voice:get-permission-snapshot',
  voiceRevokePermission: 'voice:revoke-permission',
  voiceGetDeviceSnapshot: 'voice:get-device-snapshot',
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
    readonly request: AssistantMessageRequest;
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

  readonly [ipcChannels.conversationList]: {
    readonly response: ConversationSnapshot;
  };

  readonly [ipcChannels.conversationCreate]: {
    readonly response: ConversationSnapshot;
  };

  readonly [ipcChannels.conversationSelect]: {
    readonly request: string;
    readonly response: ConversationSnapshot;
  };

  readonly [ipcChannels.conversationRename]: {
    readonly request: RenameConversationRequest;
    readonly response: ConversationSnapshot;
  };

  readonly [ipcChannels.conversationDelete]: {
    readonly request: string;
    readonly response: ConversationSnapshot;
  };

  readonly [ipcChannels.voiceGetPermissionSnapshot]: {
    readonly response: VoiceNativePermissionSnapshot;
  };

  readonly [ipcChannels.voiceRevokePermission]: {
    readonly response: VoiceNativePermissionSnapshot;
  };

  readonly [ipcChannels.voiceGetDeviceSnapshot]: {
    readonly response: VoiceNativeDeviceSnapshot;
  };

}

export type IpcChannel = keyof IpcRequestMap;

export type IpcResponse<TChannel extends IpcChannel> = IpcRequestMap[TChannel]['response'];
