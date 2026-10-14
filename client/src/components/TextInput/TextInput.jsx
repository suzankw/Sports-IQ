import { useId } from 'react';
import { cx } from '../../lib/cx.js';
import { Icon } from '../Icon/Icon.jsx';
import styles from './TextInput.module.css';

/** Labelled text input, optionally with a leading icon. Pass `error` to show a message under it. */
export function TextInput({ label, hideLabel, icon, error, className, ...rest }) {
  const id = useId();
  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={id} className={hideLabel ? 'visually-hidden' : styles.label}>
        {label}
      </label>
      <div className={styles.control}>
        {icon && <Icon name={icon} size="sm" className={styles.icon} />}
        <input id={id} className={cx(styles.input, icon && styles.withIcon)} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...rest} />
      </div>
      {error && (
        <p id={`${id}-error`} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
