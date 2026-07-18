import type { LogLevel } from '@hanna/types';

export interface Logger {
  readonly debug: (message: string, context?: Record<string, unknown>) => void;
  readonly info: (message: string, context?: Record<string, unknown>) => void;
  readonly warn: (message: string, context?: Record<string, unknown>) => void;
  readonly error: (message: string, context?: Record<string, unknown>) => void;
}

const getPriority = (level: LogLevel): number => {
  switch (level) {
    case 'debug':
      return 10;
    case 'info':
      return 20;
    case 'warn':
      return 30;
    case 'error':
      return 40;
  }

  throw new Error(`Unsupported log level: ${String(level)}`);
};

export const createLogger = (scope: string, minimumLevel: LogLevel): Logger => {
  const write = (level: LogLevel, message: string, context?: Record<string, unknown>): void => {
    if (getPriority(level) < getPriority(minimumLevel)) {
      return;
    }

    const payload = {
      context,
      level,
      message,
      scope,
      timestamp: new Date().toISOString(),
    };

    if (level === 'error') {
      console.error(payload);
      return;
    }

    if (level === 'warn') {
      console.warn(payload);
      return;
    }

    console.log(payload);
  };

  return {
    debug: (message, context) => {
      write('debug', message, context);
    },
    info: (message, context) => {
      write('info', message, context);
    },
    warn: (message, context) => {
      write('warn', message, context);
    },
    error: (message, context) => {
      write('error', message, context);
    },
  };
};
