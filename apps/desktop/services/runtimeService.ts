import type { AppBootstrapState } from '@desktop/types/runtime';

export const loadRuntimeState = async (): Promise<AppBootstrapState> => {
  if (!window.hanna?.app) {
    throw new Error('HANNA IPC is not available.');
  }

  const hanna = window.hanna;

if (!hanna) {
  throw new Error("HANNA preload API is unavailable.");
}

const [metadata, config, system] = await Promise.all([
  hanna.app.getMetadata(),
  hanna.app.getConfig(),
  hanna.app.getSystemSnapshot(),
]);

  return {
    metadata,
    config,
    system,
  };
};