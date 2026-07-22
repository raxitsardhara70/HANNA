import type { HannaApi } from '@hanna/types';

export const getRendererIpcClient = (): HannaApi => window.hanna;
