import { useId } from 'react';
import { cx } from '../../lib/cx.js';
import { Icon } from '../Icon/Icon.jsx';
import styles from './Select.module.css';

/** Native select with a label (visually hidden with `hideLabel`). options: [{ value, label }] */
export function Select({ label, hideLabel, options, value, onChange, className, ...rest }) {
  const id = useId();
  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={id} className={hideLabel ? 'visually-hidden' : styles.label}>
        {label}
      </label>
      <div className={styles.control}>
        <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={styles.select} {...rest}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Icon name="expand_more" className={styles.chevron} />
      </div>
    </div>
  );
}
