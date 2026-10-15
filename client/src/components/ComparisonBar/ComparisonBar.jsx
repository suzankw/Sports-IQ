import { Icon } from '../Icon/Icon.jsx';
import styles from './ComparisonBar.module.css';

/** One team stat, Turi on the left and the opponent on the right; each bar is its share of the total. */
export function ComparisonBar({ label, icon, left, right, leftText, rightText }) {
  const total = left + right;
  const share = (value) => (total ? (value / total) * 100 : 0);
  return (
    <div className={styles.row}>
      <span className={styles.value}>{leftText}</span>
      <span className={styles.label}>
        {icon && <Icon name={icon} size="sm" className={styles.icon} />}
        {label}
      </span>
      <span className={styles.value}>{rightText}</span>
      <div className={styles.track} aria-hidden="true">
        <span className={styles.left} style={{ '--share': `${share(left)}%` }} />
        <span className={styles.right} style={{ '--share': `${share(right)}%` }} />
      </div>
    </div>
  );
}
