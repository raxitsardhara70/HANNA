import type { AppMetadata, RuntimeConfig, SystemSnapshot } from '@hanna/types';

export interface AppBootstrapState {
  readonly config: RuntimeConfig;
  readonly metadata: AppMetadata;
  readonly system: SystemSnapshot;
}
