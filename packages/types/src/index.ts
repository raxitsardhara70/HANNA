export type AppEnvironment = 'development' | 'test' | 'production';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

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
  readonly platform: NodeJS.Platform;
  readonly arch: NodeJS.Architecture;
  readonly electronVersion: string;
  readonly nodeVersion: string;
}

export interface HannaApi {
  readonly app: {
    readonly getMetadata: () => Promise<AppMetadata>;
    readonly getConfig: () => Promise<RuntimeConfig>;
    readonly getSystemSnapshot: () => Promise<SystemSnapshot>;
  };
}
