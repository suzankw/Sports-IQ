import { cx } from '../../lib/cx.js';
import { Icon } from '../Icon/Icon.jsx';
import styles from './StatCard.module.css';

/** A labelled headline number. `change` (e.g. +5) shows a trend chip. */
export function StatCard({ label, value, change, changeLabel, accent = 'navy' }) {
  const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
  return (
    <div className={cx(styles.card, styles[accent])}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>
        {value}
        {change != null && (
          <span className={cx(styles.change, styles[direction])}>
            <Icon name={`trending_${direction}`} size="sm" />
            {changeLabel}
          </span>
        )}
      </p>
    </div>
  );
}
