import { cx } from '../../lib/cx.js';
import styles from './Checkbox.module.css';

/** Native checkbox with its label beside it (works with react-hook-form's register). */
export function Checkbox({ label, hint, className, ...rest }) {
  return (
    <label className={cx(styles.checkbox, className)}>
      <input type="checkbox" className={styles.box} {...rest} />
      <span>
        {label}
        {hint && <span className={styles.hint}>{hint}</span>}
      </span>
    </label>
  );
}
