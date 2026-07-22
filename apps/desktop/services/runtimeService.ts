import type { AppBootstrapState } from '@desktop/types/runtime';

export const loadRuntimeState = async (): Promise<AppBootstrapState> => {
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
