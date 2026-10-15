import { Badge } from '../../../components/Badge/Badge.jsx';
import { Button } from '../../../components/Button/Button.jsx';
import { Matchup } from '../../../components/Matchup/Matchup.jsx';
import { ResourceScreen } from '../../../components/ResourceScreen/ResourceScreen.jsx';
import { Select } from '../../../components/Select/Select.jsx';
import { useMe } from '../../../hooks/auth.js';
import { useList, useResource } from '../../../hooks/resources.js';
import { useUrlState } from '../../../hooks/useUrlState.js';
import { formatDay, formatTime } from '../../../lib/dates.js';
import { newestFirst, optionsOf, teamSeasonLabel } from '../../../lib/options.js';
import { FixtureDialogBody } from './FixtureForm.jsx';
import styles from './FixturesPage.module.css';

const VIEWS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'awaitingResult', label: 'Waiting for a result' },
  { value: 'completed', label: 'Played' },
  { value: 'all', label: 'All' },
];

function StatusBadge({ match }) {
  if (match.status === 'live') return <Badge tone="red">Live</Badge>;
  if (match.status === 'upcoming') return <Badge>Upcoming</Badge>;
  return match.published ? (
    <Badge tone="positive">Published</Badge>
  ) : (
    <Badge tone="gold">Draft</Badge>
  );
}

const matchName = (m) => `${m.team.name} v ${m.opponent.shortName} on ${formatDay(m.kickoffAt)}`;

const columns = [
  {
    key: 'date',
    header: 'Date',
    render: (m) => (
      <span className={styles.date}>
        {formatDay(m.kickoffAt)}
        <span>{formatTime(m.kickoffAt)}</span>
      </span>
    ),
  },
  {
    key: 'match',
    header: 'Match',
    isRowHeader: true,
    render: (m) => (
      <>
        <Matchup match={m} />
        <span className={styles.team}>{m.team.name}</span>
      </>
    ),
  },
  {
    key: 'competition',
    header: 'Competition',
    render: (m) => [m.competition.shortName, m.round].filter(Boolean).join(' · '),
  },
  { key: 'status', header: 'Status', render: (m) => <StatusBadge match={m} /> },
];

/** D13 Fixtures & results. Coaches see their own teams; "Result" opens D14. */
export function FixturesPage() {
  const me = useMe().data;
  const isAdmin = me.user.role === 'admin';
  const all = useList('/team-seasons', {}, { enabled: isAdmin });
  const choices = isAdmin ? (all.data ?? []) : newestFirst(me.permissions.teamSeasons);
  const [url, setUrl] = useUrlState({ teamSeason: '', view: 'upcoming' });
  const view = url.view === 'all' ? { sort: '-kickoffAt' } : { view: url.view };
  const query = useList('/matches', {
    ...view,
    ...(url.teamSeason ? { teamSeason: url.teamSeason } : isAdmin ? {} : { mine: true }),
  });
  return (
    <ResourceScreen
      title="Fixtures & results"
      subtitle="Add fixtures, then enter each result — the public schedule updates when you publish."
      noun="fixture"
      nameOf={matchName}
      filters={
        <>
          <Select
            label="Team"
            options={[
              { value: '', label: isAdmin ? 'All teams' : 'All my teams' },
              ...optionsOf(choices, teamSeasonLabel),
            ]}
            value={url.teamSeason}
            onChange={(e) => setUrl({ teamSeason: e.target.value })}
          />
          <Select
            label="Show"
            options={VIEWS}
            value={url.view}
            onChange={(e) => setUrl({ view: e.target.value })}
          />
        </>
      }
      query={query}
      resource={useResource('/matches')}
      columns={columns}
      Form={FixtureDialogBody}
      formProps={{ teamSeasons: choices, defaultTeamSeason: url.teamSeason || choices[0]?.id }}
      rowActions={(m) => (
        <Button
          variant="outline"
          size="sm"
          icon="scoreboard"
          to={`/dashboard/fixtures/${m.id}/result`}
          aria-label={`Result of ${matchName(m)}`}
        >
          Result
        </Button>
      )}
    />
  );
}
