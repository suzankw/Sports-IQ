import { cx } from '../../lib/cx.js';
import styles from './Icon.module.css';

/** Material Symbol. Decorative unless `label` is given. Names must be listed in iconNames.js. */
export function Icon({ name, size = 'md', filled = false, label, className }) {
  return (
    <span
      className={cx('material-symbols-outlined', styles.icon, styles[size], filled && styles.filled, className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : 'true'}
    >
      {name}
    </span>
  );
}
