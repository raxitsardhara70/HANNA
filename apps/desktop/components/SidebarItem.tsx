import type { NavigationItem } from '../types/navigation';
import styles from './SidebarItem.module.css';

interface SidebarItemProps {
  readonly item: NavigationItem;
  readonly collapsed: boolean;
  readonly selected: boolean;
  readonly onSelect: (item: NavigationItem) => void;
}

export const SidebarItem = ({ collapsed, item, onSelect, selected }: SidebarItemProps) => (
  <button
    aria-current={selected ? 'page' : undefined}
    className={styles.item}
    data-collapsed={collapsed}
    data-selected={selected}
    onClick={() => onSelect(item)}
    title={collapsed ? item.label : undefined}
    type="button"
  >
    <span className={styles.icon} aria-hidden="true">
      {item.icon}
    </span>
    <span className={styles.label}>{item.label}</span>
    {item.badge === undefined ? null : <span className={styles.badge}>{item.badge}</span>}
  </button>
);
