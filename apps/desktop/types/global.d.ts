import type { HannaApi } from '@hanna/types';

declare global {
  interface Window {
    readonly hanna?: HannaApi;
  }
}

export {};