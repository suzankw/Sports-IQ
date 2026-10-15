import { Badge } from '../../../components/Badge/Badge.jsx';
import styles from './ResultPage.module.css';

/** One numbered accordion step of result entry; it opens itself when the server flags a problem in it. */
export function Section({ number, title, defaultOpen, flagged, wide, children }) {
  return (
    <details className={wide ? `${styles.section} ${styles.wide}` : styles.section} open={defaultOpen || flagged}>
      <summary className={styles.summary}>
        <span className={styles.number}>{number}</span>
        <span className={styles.sectionTitle}>{title}</span>
        {flagged && <Badge tone="red">Check</Badge>}
      </summary>
      <div className={styles.sectionBody}>{children}</div>
    </details>
  );
}
