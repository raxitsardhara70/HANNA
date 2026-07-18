import type { AppEnvironment, LogLevel, RuntimeConfig } from '@hanna/types';
import { readEnv } from '@hanna/utils';

const environments: readonly AppEnvironment[] = ['development', 'test', 'production'];
const logLevels: readonly LogLevel[] = ['debug', 'info', 'warn', 'error'];

const parseOneOf = <T extends string>(value: string, allowed: readonly T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback;

export const loadRuntimeConfig = (): RuntimeConfig => {
  const environment = parseOneOf(readEnv('HANNA_ENV', 'development'), environments, 'development');
  const logLevel = parseOneOf(readEnv('HANNA_LOG_LEVEL', 'info'), logLevels, 'info');

  return {
    environment,
    isDevelopment: environment === 'development',
    logLevel,
  };
};
