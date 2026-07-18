import styles from './StatusBadge.module.css';

interface StatusBadgeProps {
  readonly label: string;
  readonly value: string;
}

export const StatusBadge = ({ label, value }: StatusBadgeProps) => (
  <span className={styles.badge} aria-label={`${label}: ${value}`}>
    {value}
  </span>
);
