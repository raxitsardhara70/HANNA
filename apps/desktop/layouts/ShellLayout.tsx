import type { ReactNode } from 'react';
import { SidebarItem } from '../components/SidebarItem';
import type { AppShellState } from '../stores/appShellStore';
import type { AppPageId, NavigationItem } from '../types/navigation';
import type { AppBootstrapState } from '../types/runtime';
import styles from './ShellLayout.module.css';

interface ShellLayoutProps {
  readonly children: ReactNode;
  readonly currentTime: string;
  readonly navigationItems: readonly NavigationItem[];
  readonly pageTitle: string;
  readonly runtime: AppBootstrapState | null;
  readonly shellState: AppShellState;
  readonly onNavigate: (pageId: AppPageId) => void;
  readonly onToggleSidebar: () => void;
}

export const ShellLayout = ({
  children,
  currentTime,
  navigationItems,
  onNavigate,
  onToggleSidebar,
  pageTitle,
  runtime,
  shellState,
}: ShellLayoutProps) => (
  <main className={styles.shell} data-sidebar-collapsed={shellState.sidebarCollapsed}>
    <aside className={styles.sidebar}>
      <div className={styles.brandRow}>
        <div className={styles.brandMark}>H</div>
        <div className={styles.brandText}>
          <strong>HANNA</strong>
          <span>Desktop</span>
        </div>
      </div>

      <nav className={styles.nav} aria-label="Primary navigation">
        {navigationItems.map((item) => (
          <SidebarItem
            collapsed={shellState.sidebarCollapsed}
            item={item}
            key={item.id}
            onSelect={() => onNavigate(item.id)}
            selected={item.id === shellState.selectedPage}
          />
        ))}
      </nav>

      <button className={styles.collapseButton} onClick={onToggleSidebar} type="button">
        <span aria-hidden="true">{shellState.sidebarCollapsed ? '>' : '<'}</span>
        <span>{shellState.sidebarCollapsed ? 'Expand' : 'Collapse'}</span>
      </button>
    </aside>

    <section className={styles.workspace}>
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <div className={styles.breadcrumb}>HANNA / {pageTitle}</div>
          <h1>{pageTitle}</h1>
        </div>

        <div className={styles.headerControls}>
          <div className={styles.search} aria-label="Global search">
            Search HANNA
          </div>
          <div className={styles.modelIndicator}>Model: Pending</div>
          <div className={styles.connection} data-online="true">
            Local
          </div>
          <button className={styles.iconButton} type="button" aria-label="Theme settings">
            T
          </button>
          <button className={styles.iconButton} onClick={() => onNavigate('settings')} type="button">
            S
          </button>
        </div>
      </header>

      <section className={styles.content}>{children}</section>

      <footer className={styles.statusBar}>
        <span>v{runtime?.metadata.version ?? '0.1.0'}</span>
        <span>{runtime?.config.environment ?? 'loading'}</span>
        <span>Provider: {shellState.providerStatus}</span>
        <span>Memory: Ready</span>
        <span>Branch: main</span>
        <span>{currentTime}</span>
      </footer>
    </section>
  </main>
);
