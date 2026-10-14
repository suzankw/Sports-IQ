import { cx } from '../../lib/cx.js';
import { initials } from '../../lib/initials.js';
import { Icon } from '../Icon/Icon.jsx';
import styles from './PhotoCard.module.css';

/**
 * A portrait card with a navy gradient and text over it (coaches, captain, squad).
 * Initials (of `initialsOf`, default `name`) on navy when there's no photo. `highlight` adds the gold captain border.
 */
export function PhotoCard({ photoUrl, name, initialsOf = name, eyebrow, eyebrowIcon, detail, badge, highlight, size = 'md', className }) {
  return (
    <article className={cx(styles.card, styles[size], highlight && styles.highlight, className)}>
      {photoUrl ? (
        <img src={photoUrl} alt="" className={styles.photo} loading="lazy" />
      ) : (
        <span className={styles.initials} aria-hidden="true">
          {initials(initialsOf)}
        </span>
      )}
      {badge && <span className={styles.badge}>{badge}</span>}
      <div className={styles.text}>
        {eyebrow && (
          <p className={styles.eyebrow}>
            {eyebrowIcon && <Icon name={eyebrowIcon} size="sm" />}
            {eyebrow}
          </p>
        )}
        <h3 className={styles.name}>{name}</h3>
        {detail && <p className={styles.detail}>{detail}</p>}
      </div>
    </article>
  );
}
