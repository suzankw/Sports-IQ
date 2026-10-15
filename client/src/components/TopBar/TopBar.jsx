import { NavLink } from 'react-router';
import { cx } from '../../lib/cx.js';
import { Icon } from '../Icon/Icon.jsx';
import styles from './TopBar.module.css';

/** The 64px navy top bar: section links, a menu button on mobile, and the account corner. */
export function TopBar({ links, label, onMenuClick, end }) {
  return (
    <header className={styles.bar} data-print="hide">
      <button type="button" className={styles.menu} onClick={onMenuClick} aria-label="Open menu">
        <Icon name="menu" size="lg" />
      </button>
      <nav aria-label={label} className={styles.nav}>
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => cx(styles.link, isActive && styles.active)}>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className={styles.end}>{end}</div>
    </header>
  );
}
