import { Link } from 'react-router';
import { useMe } from '../../hooks/auth.js';
import { useHomeSchool } from '../../hooks/schools.js';
import { AppShell } from '../AppShell/AppShell.jsx';
import { AvatarMenu } from '../AvatarMenu/AvatarMenu.jsx';
import { menuFor } from './menu.js';
import styles from './DashboardShell.module.css';

/** Staff dashboard layout: the same shell, its own menu filtered by the user's permissions. */
export function DashboardShell() {
  const me = useMe();
  const school = useHomeSchool();
  return (
    <AppShell
      sidebar={{
        label: 'Dashboard',
        brand: { crestUrl: school.data?.crestUrl, name: school.data?.name ?? "St. Andrew's Turi", tagline: 'Staff dashboard' },
        items: menuFor(me.data.permissions.screens),
      }}
      topBar={{
        label: 'Dashboard',
        links: [],
        end: (
          <>
            <Link to="/" className={styles.publicLink}>
              View public site
            </Link>
            <AvatarMenu me={me.data} inDashboard />
          </>
        ),
      }}
    />
  );
}
