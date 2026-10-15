import { useParams } from 'react-router';
import { Card, CardHeader } from '../../../components/Card/Card.jsx';
import { PageHeader } from '../../../components/PageHeader/PageHeader.jsx';
import { QueryState } from '../../../components/QueryState/QueryState.jsx';
import { TabPanel } from '../../../components/Tabs/Tabs.jsx';
import { TeamSeasonFilters } from '../../../components/TeamSeasonFilters/TeamSeasonFilters.jsx';
import { useSport } from '../../../hooks/sports.js';
import { useTeamSeason, useTeamSelection } from '../../../hooks/teamSeasons.js';
import { positionNames } from '../../../lib/people.js';
import { RosterAnalytics } from './RosterAnalytics.jsx';
import { RosterHero } from './RosterHero.jsx';
import { SquadGrid } from './SquadGrid.jsx';
import styles from './RosterPage.module.css';

export function RosterPage() {
  const { sport: slug } = useParams();
  const sport = useSport(slug);
  const selection = useTeamSelection(slug);
  const teamSeason = useTeamSeason(selection.selected?.id);
  const positions = positionNames(sport.data);
  const name = selection.selected?.team.name ?? 'Roster';
  const pageTitle = selection.selected && sport.data ? `${name} ${sport.data.name} · Roster` : 'Roster';

  return (
    <>
      <title>{`${pageTitle} · Sports IQ`}</title>
      <PageHeader
        eyebrow="Roster"
        title={name}
        subtitle={selection.season && `${sport.data?.name ?? ''} • ${selection.season.label} Season`}
        actions={<TeamSeasonFilters selection={selection} />}
      />
      <QueryState query={selection.selected ? teamSeason : selection.query} isEmpty={() => !selection.selected} emptyText="No teams are entered for this season yet.">
        {(data) => (
          <TabPanel id={data.team.slug} className={styles.page}>
            <RosterHero teamSeason={data} positions={positions} />
            <SquadGrid teamSeason={data} positions={positions} />
            <RosterAnalytics analytics={data.analytics} />
            {data.gallery.length > 0 && (
              <Card>
                <CardHeader title="Recent Match Gallery" />
                <ul className={styles.gallery}>
                  {data.gallery.map((photo) => (
                    <li key={photo.url}>
                      <img src={photo.url} alt="" loading="lazy" />
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </TabPanel>
        )}
      </QueryState>
    </>
  );
}
