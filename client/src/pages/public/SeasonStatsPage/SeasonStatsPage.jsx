import { useParams } from 'react-router';
import { PageHeader } from '../../../components/PageHeader/PageHeader.jsx';
import { QueryState } from '../../../components/QueryState/QueryState.jsx';
import { Quote } from '../../../components/Quote/Quote.jsx';
import { TabPanel, Tabs } from '../../../components/Tabs/Tabs.jsx';
import { TeamSeasonFilters } from '../../../components/TeamSeasonFilters/TeamSeasonFilters.jsx';
import { useSeasonStats } from '../../../hooks/seasonStats.js';
import { useSport } from '../../../hooks/sports.js';
import { useTeamSelection } from '../../../hooks/teamSeasons.js';
import { useUrlState } from '../../../hooks/useUrlState.js';
import { scoreUnit } from '../../../lib/scoring.js';
import { LeaderboardsTab } from './LeaderboardsTab.jsx';
import { OverviewTab } from './OverviewTab.jsx';
import { PerformanceTab } from './PerformanceTab.jsx';
import styles from './SeasonStatsPage.module.css';

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'info' },
  { id: 'scoring', label: 'Scoring', icon: 'sports_score' },
  { id: 'discipline', label: 'Discipline', icon: 'gavel' },
  { id: 'performance', label: 'Performance', icon: 'monitoring' },
];

export function SeasonStatsPage() {
  const { sport: slug } = useParams();
  const sport = useSport(slug);
  const selection = useTeamSelection(slug);
  const stats = useSeasonStats(selection.selected?.id);
  const [{ tab }, setUrl] = useUrlState({ tab: 'overview' });
  const subtitle = selection.selected && sport.data ? `${selection.season.label} ${selection.selected.team.name} ${sport.data.name}` : null;
  const unit = scoreUnit(sport.data).word;

  return (
    <>
      <title>{`Season Statistics${subtitle ? ` · ${subtitle}` : ''} · Sports IQ`}</title>
      <PageHeader title="Season Statistics" subtitle={subtitle} actions={<TeamSeasonFilters selection={selection} />} />
      <div className={styles.tabBar}>
        <Tabs label="Statistics sections" items={TABS} value={tab} onChange={(next) => setUrl({ tab: next })} />
      </div>
      <QueryState query={selection.selected ? stats : selection.query} isEmpty={() => !selection.selected || !sport.data} emptyText="No teams are entered for this season yet.">
        {(data) => (
          <>
            <TabPanel id="overview" hidden={tab !== 'overview'}>
              <OverviewTab stats={data} sport={sport.data} />
            </TabPanel>
            <TabPanel id="scoring" hidden={tab !== 'scoring'}>
              <LeaderboardsTab stats={data} sport={sport.data} group="attack" />
            </TabPanel>
            <TabPanel id="discipline" hidden={tab !== 'discipline'}>
              <LeaderboardsTab stats={data} sport={sport.data} group="discipline" />
            </TabPanel>
            <TabPanel id="performance" hidden={tab !== 'performance'}>
              <PerformanceTab stats={data} sport={slug} unit={unit} />
            </TabPanel>
            {data.quote && <Quote text={data.quote.text} attribution={data.quote.attribution} />}
          </>
        )}
      </QueryState>
    </>
  );
}
