import { useCallback, useState } from 'react';
import { Outlet, useLocation, useParams, useSearchParams } from 'react-router';
import { useSports } from '../../hooks/sports.js';
import { useHomeSchool } from '../../hooks/schools.js';
import { AccountCorner } from '../AccountCorner/AccountCorner.jsx';
import { Footer } from '../Footer/Footer.jsx';
import { Sidebar } from '../Sidebar/Sidebar.jsx';
import { TopBar } from '../TopBar/TopBar.jsx';
import { sectionsFor } from './sections.js';
import styles from './PublicShell.module.css';

const TAGLINE = 'Excellence & Character';

export function PublicShell() {
  const params = useParams();
  const [search] = useSearchParams();
  const location = useLocation();
  const sports = useSports();
  const school = useHomeSchool();
  // The drawer belongs to the page it was opened on, so navigating closes it.
  const [menuOpenOn, setMenuOpenOn] = useState(null);
  const menuOpen = menuOpenOn === location.pathname;
  const closeMenu = useCallback(() => setMenuOpenOn(null), []);

  const sport = params.sport ?? search.get('sport') ?? sports.data?.[0]?.slug ?? 'football';
  const schoolName = school.data?.name ?? "St. Andrew's Turi";

  return (
    <div className={styles.shell}>
      <a href="#main" className={styles.skip}>
        Skip to content
      </a>
      <Sidebar
        label="Sports"
        brand={{ crestUrl: school.data?.crestUrl, name: schoolName, tagline: TAGLINE }}
        items={(sports.data ?? []).map((s) => ({ to: `/${s.slug}`, label: s.name, icon: s.icon }))}
        open={menuOpen}
        onClose={closeMenu}
      />
      <div className={styles.column}>
        <TopBar label="Sections" links={sectionsFor(sport)} onMenuClick={() => setMenuOpenOn(location.pathname)} end={<AccountCorner />} />
        <main id="main" tabIndex={-1} className={styles.main}>
          <Outlet />
        </main>
        <Footer schoolName={schoolName} />
      </div>
    </div>
  );
}
