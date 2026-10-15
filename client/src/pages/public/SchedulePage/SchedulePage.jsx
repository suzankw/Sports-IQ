import { useParams } from 'react-router';
import { Card } from '../../../components/Card/Card.jsx';
import { LiveBanner } from '../../../components/LiveBanner/LiveBanner.jsx';
import { PageHeader } from '../../../components/PageHeader/PageHeader.jsx';
import { QueryState } from '../../../components/QueryState/QueryState.jsx';
import { Select } from '../../../components/Select/Select.jsx';
import { TabPanel, Tabs } from '../../../components/Tabs/Tabs.jsx';
import { useMatches } from '../../../hooks/matches.js';
import { useSeasonFromUrl } from '../../../hooks/seasons.js';
import { useSport } from '../../../hooks/sports.js';
import { useTeamSeasons } from '../../../hooks/teamSeasons.js';
import { useUrlState } from '../../../hooks/useUrlState.js';
import { formatMonth, monthsBetween } from '../../../lib/dates.js';
import { FixtureTable } from './FixtureTable.jsx';
import styles from './SchedulePage.module.css';

const VIEWS = [
  { id: 'upcoming', label: 'Upcoming fixtures' },
  { id: 'completed', label: 'Completed' },
];

export function SchedulePage() {
  const { sport: slug } = useParams();
  const sport = useSport(slug);
  const { season } = useSeasonFromUrl();
  const [url, setUrl] = useUrlState({ team: '', month: '', view: 'upcoming' });
  const teams = useTeamSeasons({ sport: slug });
  const matches = useMatches({ sport: slug, team: url.team || undefined, month: url.month || undefined, view: url.view, pageSize: 200 });
  const months = season ? monthsBetween(season.startDate, season.endDate) : [];

  return (
    <>
      <title>{`${sport.data?.name ?? ''} Schedule · Sports IQ`}</title>
      <PageHeader
        title={`${sport.data?.name ?? ''} Schedule`}
        subtitle={season && `${season.label} fixtures and results`}
        actions={
          <>
            <Select label="Team" hideLabel value={url.team} onChange={(e) => setUrl({ team: e.target.value })} options={[{ value: '', label: 'All teams' }, ...(teams.data ?? []).map((ts) => ({ value: ts.team.slug, label: ts.team.name }))]} />
            <Select label="Month" hideLabel value={url.month} onChange={(e) => setUrl({ month: e.target.value })} options={[{ value: '', label: 'All months' }, ...months.map((m) => ({ value: m, label: formatMonth(m) }))]} />
          </>
        }
      />
      <LiveBanner sport={slug} />
      <Card>
        <div className={styles.tabs}>
          <Tabs variant="underline" label="Fixtures" items={VIEWS} value={url.view} onChange={(view) => setUrl({ view })} />
        </div>
        <TabPanel id={url.view}>
          <QueryState query={matches} isEmpty={(rows) => rows.length === 0} emptyText="No fixtures match these filters.">
            {(rows) => <FixtureTable rows={rows} sport={slug} />}
          </QueryState>
        </TabPanel>
      </Card>
    </>
  );
}
