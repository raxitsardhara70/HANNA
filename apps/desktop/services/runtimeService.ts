import type { AppBootstrapState } from '@desktop/types/runtime';

export const loadRuntimeState = async (): Promise<AppBootstrapState> => {
  if (!window.hanna?.app) {
    throw new Error('HANNA IPC is not available.');
  }

  const [metadata, config, system] = await Promise.all([
    window.hanna.app.getMetadata(),
    window.hanna.app.getConfig(),
    window.hanna.app.getSystemSnapshot(),
  ]);

  return {
    metadata,
    config,
    system,
  };
};