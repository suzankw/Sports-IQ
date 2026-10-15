import { Badge } from '../../../components/Badge/Badge.jsx';
import { Button } from '../../../components/Button/Button.jsx';
import { formatDay, formatTime } from '../../../lib/dates.js';
import styles from './ResultPage.module.css';

/** Sticky: back to fixtures, which match this is, and whether it's public yet. */
export function ResultHeader({ match }) {
  return (
    <header className={styles.header}>
      <Button variant="ghost" size="sm" icon="arrow_back" to="/dashboard/fixtures" className={styles.back}>
        Fixtures
      </Button>
      <div className={styles.headerText}>
        <h1 className={styles.title}>
          {match.team.name} v {match.opponent.shortName}
        </h1>
        <p className={styles.meta}>
          {formatDay(match.kickoffAt)} · {formatTime(match.kickoffAt)} · {match.competition.shortName}
          {match.round && ` · ${match.round}`}
        </p>
      </div>
      {match.published ? <Badge tone="positive">Published</Badge> : <Badge tone="gold">Draft</Badge>}
    </header>
  );
}
