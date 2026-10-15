import { Link } from 'react-router';
import { Icon } from '../../../components/Icon/Icon.jsx';
import { StandingsTable } from '../../../components/StandingsTable/StandingsTable.jsx';
import { formatShortDateTime } from '../../../lib/dates.js';
import { scoreUnit } from '../../../lib/scoring.js';
import styles from './OverviewPage.module.css';

function Widget({ title, icon, link, children }) {
  return (
    <section className={styles.widget}>
      <h2 className={styles.widgetTitle}>
        <Icon name={icon} />
        {title}
      </h2>
      {children}
      <Link to={link.to} className={styles.widgetLink}>
        {link.label}
      </Link>
    </section>
  );
}

/** The navy column: next fixtures, top scorers and the top of the league table. */
export function SidePanel({ overview }) {
  const { sport, upcoming, topScorers, standings } = overview;
  const unit = scoreUnit(sport).word;
  return (
    <aside className={styles.panel} aria-label={`${sport.name} at a glance`}>
      <Widget title="Upcoming Matches" icon="event" link={{ to: `/${sport.slug}/schedule`, label: 'View full schedule' }}>
        {upcoming.length === 0 && <p className={styles.widgetEmpty}>No fixtures scheduled.</p>}
        <ul className={styles.widgetList}>
          {upcoming.map((m) => (
            <li key={m.id} className={styles.fixture}>
              <p className={styles.fixtureWhen}>
                {formatShortDateTime(m.kickoffAt)}
                <span>{m.homeAway}</span>
              </p>
              <p className={styles.fixtureTeams}>
                {m.team.name} <span>vs {m.opponent.shortName}</span>
              </p>
            </li>
          ))}
        </ul>
      </Widget>
      <Widget title="Top Scorers" icon="military_tech" link={{ to: `/${sport.slug}/stats?tab=scoring`, label: 'View full list' }}>
        {topScorers.length === 0 && <p className={styles.widgetEmpty}>No results yet this season.</p>}
        <ol className={styles.widgetList}>
          {topScorers.map((row) => (
            <li key={row.player.id} className={styles.scorer}>
              <span className={styles.scorerRank}>{row.rank}</span>
              <span className={styles.scorerName}>{row.player.shortName}</span>
              <span className={styles.scorerValue}>
                {row.value} {unit}
              </span>
            </li>
          ))}
        </ol>
      </Widget>
      {standings && (
        <Widget title="League Standings" icon="table_chart" link={{ to: `/${sport.slug}/league-table`, label: 'View full table' }}>
          <div className={styles.miniTable}>
            <StandingsTable rows={standings.rows} compact />
          </div>
        </Widget>
      )}
    </aside>
  );
}
