import type { AppBootstrapState } from '@desktop/types/runtime';

const browserRuntimeState: AppBootstrapState = {
  config: {
    environment: 'development',
    isDevelopment: true,
    logLevel: 'info',
  },
  metadata: {
    name: 'HANNA',
    version: '0.1.0',
  },
  system: {
    arch: 'browser',
    electronVersion: 'browser',
    nodeVersion: 'browser',
    platform: 'browser',
  },
};

export const loadRuntimeState = async (): Promise<AppBootstrapState> => {
  if (!window.hanna?.app) {
    return browserRuntimeState;
  }

  const { app } = window.hanna;
  const [metadata, config, system] = await Promise.all([
    app.getMetadata(),
    app.getConfig(),
    app.getSystemSnapshot(),
  ]);

  return {
    metadata,
    config,
    system,
  };
};
