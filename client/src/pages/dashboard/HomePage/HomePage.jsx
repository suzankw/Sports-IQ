import { Badge } from '../../../components/Badge/Badge.jsx';
import { Button } from '../../../components/Button/Button.jsx';
import { Card, CardHeader } from '../../../components/Card/Card.jsx';
import { Matchup } from '../../../components/Matchup/Matchup.jsx';
import { PageHeader } from '../../../components/PageHeader/PageHeader.jsx';
import { QueryState } from '../../../components/QueryState/QueryState.jsx';
import { useMe } from '../../../hooks/auth.js';
import { useMatches } from '../../../hooks/matches.js';
import { formatDay, formatTime } from '../../../lib/dates.js';
import { staffName } from '../../../lib/people.js';
import styles from './HomePage.module.css';

function greeting() {
  const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Nairobi', hour: 'numeric', hour12: false }).format(new Date()));
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
}

function MatchList({ title, icon, params, empty }) {
  const matches = useMatches({ ...params, pageSize: 8 });
  return (
    <Card>
      <CardHeader title={title} icon={icon} />
      <QueryState query={matches} isEmpty={(rows) => rows.length === 0} emptyText={empty}>
        {(rows) => (
          <ul className={styles.list}>
            {rows.map((m) => (
              <li key={m.id} className={styles.row}>
                <span className={styles.when}>
                  {formatDay(m.kickoffAt)}
                  <small>{formatTime(m.kickoffAt)}</small>
                </span>
                <span className={styles.matchup}>
                  <Matchup match={m} />
                  <small>{m.team.name} · {m.sport.name}</small>
                </span>
                <Button to={`/dashboard/fixtures/${m.id}/result`} size="sm" variant="navy">
                  Enter result
                </Button>
              </li>
            ))}
          </ul>
        )}
      </QueryState>
    </Card>
  );
}

export function HomePage() {
  const { data: me } = useMe();
  const isAdmin = me.user.role === 'admin';
  const scope = isAdmin ? {} : { mine: true };
  return (
    <>
      <title>Dashboard · Sports IQ</title>
      <PageHeader eyebrow="Staff dashboard" title={`${greeting()}, ${staffName(me.user)}`} subtitle="Results to enter, drafts to publish and your teams." />
      <div className={styles.grid}>
        <MatchList title="Waiting for a result" icon="scoreboard" params={{ ...scope, view: 'awaitingResult' }} empty="Nothing waiting — every played match has a result." />
        <MatchList title="Drafts to publish" icon="edit" params={{ ...scope, status: 'completed', published: false }} empty="No unpublished results." />
        <Card>
          <CardHeader title={isAdmin ? 'Teams' : 'My teams'} icon="groups" />
          <div className={styles.teams}>
            {isAdmin && <p>Admins can manage every team.</p>}
            {[...me.permissions.teamSeasons]
              .sort((a, b) => b.season.slug.localeCompare(a.season.slug))
              .map((ts) => (
                <Button key={ts.id} variant="outline" size="sm" to={`/dashboard/rosters?teamSeason=${ts.id}`}>
                  {ts.team.name} · {ts.sport.name} · {ts.season.label} <Badge tone="neutral">{ts.role === 'head' ? 'Head' : 'Assistant'}</Badge>
                </Button>
              ))}
            {isAdmin && (
              <Button variant="outline" size="sm" to="/dashboard/teams">
                Manage teams
              </Button>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
