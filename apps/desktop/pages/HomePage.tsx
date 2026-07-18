import type { PageDefinition } from '../types/navigation';
import styles from './HomePage.module.css';

interface HomePageProps {
  readonly page: PageDefinition;
}

export const HomePage = ({ page }: HomePageProps) => (
  <div className={styles.page}>
    <header className={styles.header}>
      <p className={styles.kicker}>{page.eyebrow}</p>
      <h1>{page.title}</h1>
      <p className={styles.summary}>{page.description}</p>
    </header>

    <section className={styles.panel} aria-label={`${page.title} overview`}>
      <dl className={styles.statusGrid}>
        {page.metrics.map((metric) => (
          <div key={metric.label}>
            <dt>{metric.label}</dt>
            <dd>{metric.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  </div>
);
