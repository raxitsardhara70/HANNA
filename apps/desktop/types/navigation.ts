  export type AppPageId =
  | 'dashboard'
  | 'assistant'
  | 'chat'
  | 'agents'
  | 'models'
  | 'memory'
  | 'tools'
  | 'projects'
  | 'logs'
  | 'settings';

export interface NavigationItem {
  readonly id: AppPageId;
  readonly icon: string;
  readonly label: string;
  readonly badge?: string;
}

export interface PageDefinition {
  readonly id: AppPageId;
  readonly title: string;
  readonly eyebrow: string;
  readonly description: string;
  readonly metrics: readonly PageMetric[];
}

export interface PageMetric {
  readonly label: string;
  readonly value: string;
}
