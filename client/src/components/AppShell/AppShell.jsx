import { useCallback, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Sidebar } from '../Sidebar/Sidebar.jsx';
import { TopBar } from '../TopBar/TopBar.jsx';
import styles from './AppShell.module.css';

/** The layout both sites share: skip link, 256px sidebar (drawer on mobile), 64px top bar, main column. */
export function AppShell({ sidebar, topBar, footer }) {
  const location = useLocation();
  // The drawer belongs to the page it was opened on, so navigating closes it.
  const [menuOpenOn, setMenuOpenOn] = useState(null);
  const closeMenu = useCallback(() => setMenuOpenOn(null), []);

  return (
    <div className={styles.shell}>
      <a href="#main" className={styles.skip}>
        Skip to content
      </a>
      <Sidebar {...sidebar} open={menuOpenOn === location.pathname} onClose={closeMenu} />
      <div className={styles.column}>
        <TopBar {...topBar} onMenuClick={() => setMenuOpenOn(location.pathname)} />
        <main id="main" tabIndex={-1} className={styles.main}>
          <Outlet />
        </main>
        {footer}
      </div>
    </div>
  );
}
