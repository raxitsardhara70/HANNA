import type { AppBootstrapState } from '@desktop/types/runtime';

export const loadRuntimeState = async (): Promise<AppBootstrapState> => {
  if (!window.hanna?.app) {
    throw new Error('HANNA IPC is not available.');
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
