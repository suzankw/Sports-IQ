import { useParams, useSearchParams } from 'react-router';
import { useHomeSchool } from '../../hooks/schools.js';
import { useSports } from '../../hooks/sports.js';
import { AccountCorner } from '../AccountCorner/AccountCorner.jsx';
import { AppShell } from '../AppShell/AppShell.jsx';
import { Footer } from '../Footer/Footer.jsx';
import { sectionsFor } from './sections.js';

const TAGLINE = 'Excellence & Character';

export function PublicShell() {
  const params = useParams();
  const [search] = useSearchParams();
  const sports = useSports();
  const school = useHomeSchool();
  const sport = params.sport ?? search.get('sport') ?? sports.data?.[0]?.slug ?? 'football';
  const schoolName = school.data?.name ?? "St. Andrew's Turi";

  return (
    <AppShell
      sidebar={{
        label: 'Sports',
        brand: { crestUrl: school.data?.crestUrl, name: schoolName, tagline: TAGLINE },
        items: (sports.data ?? []).map((s) => ({ to: `/${s.slug}`, label: s.name, icon: s.icon })),
      }}
      topBar={{ label: 'Sections', links: sectionsFor(sport), end: <AccountCorner /> }}
      footer={<Footer schoolName={schoolName} />}
    />
  );
}
