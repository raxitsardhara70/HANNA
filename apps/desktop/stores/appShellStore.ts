import type { AppPageId } from '../types/navigation';

export type AppTheme = 'dark';
export type WindowState = 'focused' | 'idle';
export type ProviderStatus = 'not-configured' | 'ready' | 'offline';
export type AiStatus = 'standby' | 'thinking' | 'offline';

export interface AppNotification {
  readonly id: string;
  readonly message: string;
  readonly tone: 'info' | 'success' | 'warning' | 'error';
}

export interface AppShellState {
  readonly selectedPage: AppPageId;
  readonly sidebarCollapsed: boolean;
  readonly theme: AppTheme;
  readonly windowState: WindowState;
  readonly loading: boolean;
  readonly notifications: readonly AppNotification[];
  readonly providerStatus: ProviderStatus;
  readonly aiStatus: AiStatus;
}

export const createInitialAppShellState = (): AppShellState => ({
  aiStatus: 'standby',
  loading: false,
  notifications: [],
  providerStatus: 'not-configured',
  selectedPage: 'dashboard',
  sidebarCollapsed: false,
  theme: 'dark',
  windowState: 'focused',
});

export const selectPage = (state: AppShellState, selectedPage: AppPageId): AppShellState => ({
  ...state,
  selectedPage,
});

export const toggleSidebar = (state: AppShellState): AppShellState => ({
  ...state,
  sidebarCollapsed: !state.sidebarCollapsed,
});
