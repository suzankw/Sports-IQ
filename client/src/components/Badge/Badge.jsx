import { cx } from '../../lib/cx.js';
import styles from './Badge.module.css';

/** Small label. tone: navy · gold · red · neutral · blue · positive. */
export function Badge({ tone = 'neutral', children }) {
  return <span className={cx(styles.badge, styles[tone])}>{children}</span>;
}

const RESULT_WORDS = { W: 'Win', D: 'Draw', L: 'Loss' };

/** One W/D/L result in a form guide. */
export function FormPill({ result }) {
  return (
    <span className={cx(styles.pill, styles[result])} title={RESULT_WORDS[result]}>
      <span aria-hidden="true">{result}</span>
      <span className="visually-hidden">{RESULT_WORDS[result]}</span>
    </span>
  );
}
