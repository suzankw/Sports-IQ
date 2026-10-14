import { Badge } from '../../../components/Badge/Badge.jsx';
import { Button } from '../../../components/Button/Button.jsx';
import { DataTable } from '../../../components/DataTable/DataTable.jsx';
import { Matchup } from '../../../components/Matchup/Matchup.jsx';
import { formatDay, formatTime } from '../../../lib/dates.js';
import styles from './SchedulePage.module.css';

function Status({ match, sport }) {
  if (match.status === 'live') return <Badge tone="red">Live</Badge>;
  if (match.status === 'upcoming') return <Badge tone="navy">Upcoming</Badge>;
  return (
    <Button variant="gold" size="sm" to={`/${sport}/schedule/${match.id}`} aria-label={`Summary: ${match.team.name} vs ${match.opponent.name}`}>
      Summary
    </Button>
  );
}

export function FixtureTable({ rows, sport }) {
  const columns = [
    {
      key: 'when',
      header: 'Date & time',
      render: (m) => (
        <span className={m.status === 'completed' ? styles.past : styles.when}>
          <strong>{formatDay(m.kickoffAt)}</strong>
          <span>{formatTime(m.kickoffAt)}</span>
        </span>
      ),
    },
    { key: 'matchup', header: 'Matchup', render: (m) => <Matchup match={m} /> },
    { key: 'team', header: 'Team', render: (m) => m.team.name },
    { key: 'venue', header: 'Venue', render: (m) => m.venue ?? '—' },
    { key: 'competition', header: 'Competition', render: (m) => [m.competition.shortName, m.round].filter(Boolean).join(' · ') },
    { key: 'status', header: 'Status', align: 'end', render: (m) => <Status match={m} sport={sport} /> },
  ];
  return <DataTable caption="Fixtures and results" columns={columns} rows={rows} rowKey={(m) => m.id} />;
}
