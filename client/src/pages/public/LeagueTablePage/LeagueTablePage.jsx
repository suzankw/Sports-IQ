import { useParams } from 'react-router';
import { Card } from '../../../components/Card/Card.jsx';
import { PageHeader } from '../../../components/PageHeader/PageHeader.jsx';
import { QueryState } from '../../../components/QueryState/QueryState.jsx';
import { StandingsTable } from '../../../components/StandingsTable/StandingsTable.jsx';
import { TabPanel } from '../../../components/Tabs/Tabs.jsx';
import { TeamSeasonFilters } from '../../../components/TeamSeasonFilters/TeamSeasonFilters.jsx';
import { useSport } from '../../../hooks/sports.js';
import { useStandings } from '../../../hooks/standings.js';
import { useTeamSelection } from '../../../hooks/teamSeasons.js';
import { scoreUnit } from '../../../lib/scoring.js';
import styles from './LeagueTablePage.module.css';

export function LeagueTablePage() {
  const { sport: slug } = useParams();
  const sport = useSport(slug);
  const selection = useTeamSelection(slug);
  const league = selection.selected?.leagueCompetition;
  const standings = useStandings(league?.id, selection.season?.slug);
  const unit = scoreUnit(sport.data);
  const title = selection.selected ? `${selection.selected.team.name} ${sport.data?.name ?? ''}` : 'League Table';

  return (
    <>
      <title>{`${title} · League Table · Sports IQ`}</title>
      <PageHeader title={title} subtitle={league && `${league.name} standings`} actions={<TeamSeasonFilters selection={selection} />} />
      <QueryState
        query={league ? standings : selection.query}
        isEmpty={(data) => !league || data.rows?.length === 0}
        emptyText={league ? 'No league results have been published yet this season.' : "This team isn't entered in a league this season."}
      >
        {(data) => (
          <TabPanel id={selection.selected.team.slug}>
            <Card accent="gold">
              <StandingsTable rows={data.rows} unit={unit} />
            </Card>
            <p className={styles.legend}>
              <span className={styles.champion}>Champion position</span>
              <span>
                {unit.for}: {unit.word} for
              </span>
              <span>
                {unit.against}: {unit.word} against
              </span>
            </p>
          </TabPanel>
        )}
      </QueryState>
    </>
  );
}
