import { cx } from '../../lib/cx.js';
import { Icon } from '../Icon/Icon.jsx';
import styles from './ShareMeter.module.css';

/** A labelled percentage bar ("Female Players 65% · 11 Players"). */
export function ShareMeter({ label, icon, percent, detail, tone = 'navy' }) {
  return (
    <div className={styles.meter}>
      <p className={styles.row}>
        <span className={styles.label}>
          {icon && <Icon name={icon} size="sm" />}
          {label}
        </span>
        <span className={styles.value}>
          {percent}% <span className={styles.detail}>{detail}</span>
        </span>
      </p>
      <div className={styles.track} role="presentation">
        <span className={cx(styles.fill, styles[tone])} style={{ '--percent': `${percent}%` }} />
      </div>
    </div>
  );
}
