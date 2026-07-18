import type { AppBootstrapState } from '@desktop/types/runtime';

export interface RuntimeStore {
  readonly snapshot: AppBootstrapState | null;
}

export const createRuntimeStore = (snapshot: AppBootstrapState | null): RuntimeStore => ({
  snapshot,
});
