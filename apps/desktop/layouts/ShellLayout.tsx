import type { PropsWithChildren } from 'react';
import styles from './ShellLayout.module.css';

export const ShellLayout = ({ children }: PropsWithChildren) => (
  <main className={styles.shell}>
    <aside className={styles.sidebar}>
      <div className={styles.brand}>HANNA</div>
      <nav className={styles.nav} aria-label="Primary">
        <a href="#assistant">Assistant</a>
        <a href="#workspace">Workspace</a>
        <a href="#settings">Settings</a>
      </nav>
    </aside>
    <section className={styles.content}>{children}</section>
  </main>
);
