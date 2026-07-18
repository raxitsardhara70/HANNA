import type { AppBootstrapState } from '@desktop/types/runtime';

export const loadRuntimeState = async (): Promise<AppBootstrapState> => {
  const [metadata, config, system] = await Promise.all([
    window.hanna.app.getMetadata(),
    window.hanna.app.getConfig(),
    window.hanna.app.getSystemSnapshot(),
  ]);

  return { config, metadata, system };
};
