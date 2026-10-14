import { cx } from '../../lib/cx.js';
import { initials, toneOf } from '../../lib/initials.js';
import styles from './Avatar.module.css';

/**
 * Photo, or initials on a stable colour when there's none. Decorative by default because the
 * name is shown next to it; pass `alt` when it stands alone. `tone` overrides the name-based colour.
 */
export function Avatar({ src, name, size = 'md', shape = 'circle', alt = '', tone, className }) {
  const classes = cx(styles.avatar, styles[size], styles[shape], className);
  if (src) return <img src={src} alt={alt} className={classes} loading="lazy" />;
  return (
    <span className={cx(classes, styles[tone ?? toneOf(name)])} role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : 'true'}>
      {initials(name)}
    </span>
  );
}
