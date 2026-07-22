import { useEffect, useMemo, useState } from 'react';
import { HannaLivePage } from '../assistant/HannaLivePage';
import { ShellLayout } from '../layouts/ShellLayout';
import { HomePage } from '../pages/HomePage';
import { createInitialAppShellState, selectPage, toggleSidebar } from '../stores/appShellStore';
import type { AppPageId, NavigationItem, PageDefinition } from '../types/navigation';
import type { AppBootstrapState } from '../types/runtime';

const navigationItems: readonly NavigationItem[] = [
  { icon: 'DB', id: 'dashboard', label: 'Dashboard' },
  { icon: 'AI', id: 'assistant', label: 'HANNA Live' },
  { icon: 'CH', id: 'chat', label: 'Chat' },
  { icon: 'AG', id: 'agents', label: 'Agents' },
  { icon: 'MO', id: 'models', label: 'Models' },
  { icon: 'ME', id: 'memory', label: 'Memory' },
  { icon: 'TL', id: 'tools', label: 'Tools' },
  { icon: 'PR', id: 'projects', label: 'Projects' },
  { icon: 'LG', id: 'logs', label: 'Logs' },
  { icon: 'ST', id: 'settings', label: 'Settings' },
];

const pageDefinitions: Record<AppPageId, PageDefinition> = {
  assistant: {
    description: 'Interact with HANNA using voice, camera, screen sharing and real-time AI.',
    eyebrow: 'Artificial Intelligence',
    id: 'assistant',
    metrics: [
      { label: 'Assistant', value: 'Offline' },
      { label: 'Voice', value: 'Ready' },
      { label: 'Camera', value: 'Idle' },
      { label: 'Mode', value: 'Live' },
    ],
    title: 'HANNA Live',
  },
  agents: {
    description: 'Prepare, inspect, and coordinate future specialist agent workflows.',
    eyebrow: 'Orchestration',
    id: 'agents',
    metrics: [
      { label: 'Active agents', value: '0' },
      { label: 'Queue', value: 'Clear' },
      { label: 'Mode', value: 'Manual' },
    ],
    title: 'Agents',
  },
  chat: {
    description: 'A focused conversation surface for future assistant interactions.',
    eyebrow: 'Conversation',
    id: 'chat',
    metrics: [
      { label: 'Threads', value: '0' },
      { label: 'Drafts', value: '0' },
      { label: 'Context', value: 'Ready' },
    ],
    title: 'Chat',
  },
  dashboard: {
    description: 'Monitor runtime health, workspace readiness, and future assistant modules.',
    eyebrow: 'Overview',
    id: 'dashboard',
    metrics: [
      { label: 'Shell', value: 'Ready' },
      { label: 'Runtime', value: 'Connected' },
      { label: 'Modules', value: '9' },
      { label: 'Notifications', value: '0' },
    ],
    title: 'Dashboard',
  },

  logs: {
    description: 'Central visibility for future system events, diagnostics, and audit trails.',
    eyebrow: 'Diagnostics',
    id: 'logs',
    metrics: [
      { label: 'Errors', value: '0' },
      { label: 'Warnings', value: '0' },
      { label: 'Stream', value: 'Idle' },
    ],
    title: 'Logs',
  },
  memory: {
    description: 'Review future memory controls, retention status, and user context boundaries.',
    eyebrow: 'Context',
    id: 'memory',
    metrics: [
      { label: 'Stores', value: '0' },
      { label: 'Policy', value: 'Local' },
      { label: 'Sync', value: 'Off' },
    ],
    title: 'Memory',
  },
  models: {
    description: 'Manage future model providers, routing preferences, and capability profiles.',
    eyebrow: 'Providers',
    id: 'models',
    metrics: [
      { label: 'Provider', value: 'Pending' },
      { label: 'Model', value: 'Unassigned' },
      { label: 'Fallback', value: 'None' },
    ],
    title: 'Models',
  },
  projects: {
    description: 'Organize future project workspaces, context scopes, and persistent resources.',
    eyebrow: 'Workspaces',
    id: 'projects',
    metrics: [
      { label: 'Open', value: '0' },
      { label: 'Pinned', value: '0' },
      { label: 'Index', value: 'Ready' },
    ],
    title: 'Projects',
  },
  settings: {
    description: 'Control future preferences, integrations, privacy, and desktop behavior.',
    eyebrow: 'Preferences',
    id: 'settings',
    metrics: [
      { label: 'Theme', value: 'Dark' },
      { label: 'Updates', value: 'Manual' },
      { label: 'Security', value: 'Strict' },
    ],
    title: 'Settings',
  },
  tools: {
    description: 'Prepare future tools, connectors, and local capabilities for assistant tasks.',
    eyebrow: 'Capabilities',
    id: 'tools',
    metrics: [
      { label: 'Enabled', value: '0' },
      { label: 'Pending', value: '0' },
      { label: 'Access', value: 'Restricted' },
    ],
    title: 'Tools',
  },
};

export const App = () => {
  const [state, setState] = useState<AppBootstrapState | null>(null);
  const [shellState, setShellState] = useState(createInitialAppShellState);
  const [currentTime, setCurrentTime] = useState(() =>
    new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date()),
  );

  useEffect(() => {
    let isMounted = true;

    const load = async (): Promise<void> => {
      const [metadata, config, system] = await Promise.all([
        window.hanna.app.getMetadata(),
        window.hanna.app.getConfig(),
        window.hanna.app.getSystemSnapshot(),
      ]);

      if (isMounted) {
        setState({ config, metadata, system });
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(
        new Intl.DateTimeFormat(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date()),
      );
    }, 30_000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const activePage = useMemo(
    () => pageDefinitions[shellState.selectedPage],
    [shellState.selectedPage],
  );

  return (
    <ShellLayout
      currentTime={currentTime}
      navigationItems={navigationItems}
      onNavigate={(pageId) => {
        setShellState((current) => selectPage(current, pageId));
      }}
      onToggleSidebar={() => {
        setShellState((current) => toggleSidebar(current));
      }}
      pageTitle={activePage.title}
      runtime={state}
      shellState={shellState}
    >
      {shellState.selectedPage === 'assistant' ? <HannaLivePage /> : <HomePage page={activePage} />}
    </ShellLayout>
  );
};
