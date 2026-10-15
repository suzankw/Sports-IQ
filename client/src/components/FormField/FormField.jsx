import { useId } from 'react';
import { cx } from '../../lib/cx.js';
import styles from './FormField.module.css';

/**
 * Label, hint and error around any control. `children` receives the props the control needs
 * ({ id, aria-describedby, aria-invalid }) so every input is labelled the same way.
 */
export function FormField({ label, hideLabel, hint, error, className, children }) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={id} className={hideLabel ? 'visually-hidden' : styles.label}>
        {label}
      </label>
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      {hint && (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
