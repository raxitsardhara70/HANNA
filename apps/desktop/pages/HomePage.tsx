import type { AppBootstrapState } from '../types/runtime';
import styles from './HomePage.module.css';

interface HomePageProps {
  readonly bootstrap: AppBootstrapState;
}

export const HomePage = ({ bootstrap }: HomePageProps) => (
  <div className={styles.page}>
    <header className={styles.header}>
      <p className={styles.kicker}>Desktop AI Assistant</p>
      <h1>{bootstrap.metadata.name}</h1>
      <p className={styles.summary}>
        A secure Electron foundation for assistant workflows, local context, and long-term
        product development.
      </p>
    </header>

    <section className={styles.panel} aria-label="Runtime status">
      <dl className={styles.statusGrid}>
        <div>
          <dt>Environment</dt>
          <dd>{bootstrap.config.environment}</dd>
        </div>
        <div>
          <dt>Log level</dt>
          <dd>{bootstrap.config.logLevel}</dd>
        </div>
        <div>
          <dt>Platform</dt>
          <dd>{bootstrap.system.platform}</dd>
        </div>
        <div>
          <dt>Electron</dt>
          <dd>{bootstrap.system.electronVersion}</dd>
        </div>
      </dl>
    </section>
  </div>
);
