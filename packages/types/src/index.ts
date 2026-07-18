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

export interface HannaApi {
  readonly app: {
    readonly getMetadata: () => Promise<AppMetadata>;
    readonly getConfig: () => Promise<RuntimeConfig>;
    readonly getSystemSnapshot: () => Promise<SystemSnapshot>;
  };
}