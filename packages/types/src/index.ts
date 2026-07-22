export type AppEnvironment = 'development' | 'test' | 'production';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type Platform =
  | 'aix'
  | 'android'
  | 'darwin'
  | 'freebsd'
  | 'haiku'
  | 'linux'
  | 'netbsd'
  | 'openbsd'
  | 'sunos'
  | 'win32'
  | 'cygwin'
  | 'browser';

export type Architecture =
  | 'arm'
  | 'arm64'
  | 'ia32'
  | 'loong64'
  | 'mips'
  | 'mipsel'
  | 'ppc'
  | 'ppc64'
  | 'riscv64'
  | 's390'
  | 's390x'
  | 'x64'
  | 'browser';

export interface AppMetadata {
  readonly name: string;
  readonly version: string;
}

export interface RuntimeConfig {
  readonly environment: AppEnvironment;
  readonly logLevel: LogLevel;
  readonly isDevelopment: boolean;
}

export interface SystemSnapshot {
  readonly platform: Platform;
  readonly arch: Architecture;
  readonly electronVersion: string;
  readonly nodeVersion: string;
}

export interface AssistantResponse {
  readonly text: string;
}

export interface AssistantStreamRequest {
  readonly requestId: string;
  readonly message: string;
}

export interface AssistantStreamStartEvent {
  readonly type: 'streamStart';
  readonly requestId: string;
  readonly messageId: string;
  readonly timestamp: number;
}

export interface AssistantStreamChunkEvent {
  readonly type: 'streamChunk';
  readonly requestId: string;
  readonly messageId: string;
  readonly chunk: string;
}

export interface AssistantStreamCompleteEvent {
  readonly type: 'streamComplete';
  readonly requestId: string;
  readonly messageId: string;
}

export interface AssistantStreamErrorEvent {
  readonly type: 'streamError';
  readonly requestId: string;
  readonly messageId?: string;
  readonly error: string;
}

export interface AssistantStreamCancelledEvent {
  readonly type: 'streamCancelled';
  readonly requestId: string;
  readonly messageId?: string;
}

export type AssistantStreamEvent =
  | AssistantStreamStartEvent
  | AssistantStreamChunkEvent
  | AssistantStreamCompleteEvent
  | AssistantStreamErrorEvent
  | AssistantStreamCancelledEvent;

export interface AssistantStreamHandlers {
  readonly onEvent: (event: AssistantStreamEvent) => void;
}

export interface AssistantStreamController {
  readonly requestId: string;
  readonly done: Promise<void>;
  readonly cancel: () => void;
}

export interface HannaApi {
  readonly app: {
    readonly getMetadata: () => Promise<AppMetadata>;
    readonly getConfig: () => Promise<RuntimeConfig>;
    readonly getSystemSnapshot: () => Promise<SystemSnapshot>;
  };

  readonly assistant: {
    readonly sendMessage: (message: string) => Promise<AssistantResponse>;
    readonly streamMessage: (
      message: string,
      handlers: AssistantStreamHandlers,
    ) => AssistantStreamController;
  };
}
