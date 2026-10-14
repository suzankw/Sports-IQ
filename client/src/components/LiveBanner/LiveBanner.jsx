import { Link } from 'react-router';
import { useMatches } from '../../hooks/matches.js';
import { useHomeSchool } from '../../hooks/schools.js';
import { sidesOf } from '../../lib/match.js';
import { Badge } from '../Badge/Badge.jsx';
import { Icon } from '../Icon/Icon.jsx';
import styles from './LiveBanner.module.css';

/** The sport's match in progress, if any — links to its match page. */
export function LiveBanner({ sport }) {
  const live = useMatches({ sport, status: 'live', pageSize: 1 });
  const school = useHomeSchool();
  const match = live.data?.[0];
  if (!match) return null;
  const [home, away] = sidesOf(match, school.data);
  return (
    <Link to={`/${sport}/schedule/${match.id}`} className={styles.banner}>
      <p className={styles.eyebrow}>
        <Badge tone="red">Live</Badge>
        {match.competition.name}
      </p>
      <div className={styles.score}>
        <span className={styles.team}>{home.name}</span>
        <span className={styles.goals}>{match.score?.[home.key] ?? 0}</span>
        <Icon name={match.sport.icon} size="lg" className={styles.icon} />
        <span className={styles.goals}>{match.score?.[away.key] ?? 0}</span>
        <span className={styles.team}>{away.name}</span>
      </div>
    </Link>
  );
}
