import { useEffect } from 'react';
import { NavLink } from 'react-router';
import { cx } from '../../lib/cx.js';
import { Avatar } from '../Avatar/Avatar.jsx';
import { Icon } from '../Icon/Icon.jsx';
import styles from './Sidebar.module.css';

/**
 * The 256px navy sidebar. On mobile it slides in as a drawer (`open`, `onClose`).
 * items: [{ to, label, icon, end }]
 */
export function Sidebar({ brand, items, label, footer, open, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      {open && <button type="button" className={styles.scrim} aria-label="Close menu" onClick={onClose} />}
      <aside className={cx(styles.sidebar, open && styles.open)} data-print="hide">
        <div className={styles.brand}>
          <Avatar src={brand.crestUrl} name={brand.name} size="xl" shape="square" tone="neutral" className={styles.crest} />
          <p className={styles.name}>{brand.name}</p>
          {brand.tagline && <p className={styles.tagline}>{brand.tagline}</p>}
        </div>
        <nav aria-label={label} className={styles.nav}>
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => cx(styles.item, isActive && styles.active)}>
              <Icon name={item.icon} />
              {item.label}
              {item.badge}
            </NavLink>
          ))}
        </nav>
        {footer && <div className={styles.footer}>{footer}</div>}
      </aside>
    </>
  );
}
