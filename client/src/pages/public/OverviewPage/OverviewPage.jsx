import { useParams } from 'react-router';
import { Card } from '../../../components/Card/Card.jsx';
import { QueryState } from '../../../components/QueryState/QueryState.jsx';
import { useSportOverview } from '../../../hooks/sports.js';
import { ApproachAndBenefits } from './ApproachAndBenefits.jsx';
import { HistoryAndFacts } from './HistoryAndFacts.jsx';
import { OverviewHero } from './OverviewHero.jsx';
import { SidePanel } from './SidePanel.jsx';
import { TrainingAndPathways } from './TrainingAndPathways.jsx';
import styles from './OverviewPage.module.css';

function ComingSoon({ sport }) {
  return (
    <Card className={styles.comingSoon}>
      <title>{`${sport.name} · Sports IQ`}</title>
      <h1 className={styles.sectionTitle}>{sport.name}</h1>
      <p>{sport.name} statistics are coming soon. Fixtures, squads and results will appear here once the season is set up.</p>
    </Card>
  );
}

export function OverviewPage() {
  const { sport: slug } = useParams();
  const overview = useSportOverview(slug);
  return (
    <QueryState query={overview}>
      {(data) => {
        const { sport } = data;
        if (sport.status === 'comingSoon') return <ComingSoon sport={sport} />;
        return (
          <>
            <title>{`${sport.name} · Sports IQ`}</title>
            <OverviewHero hero={sport.content.hero} fallbackTitle={`${sport.name} IQ`} />
            <div className={styles.layout}>
              <HistoryAndFacts history={sport.content.history} facts={sport.content.facts} />
              <SidePanel overview={data} />
            </div>
            <ApproachAndBenefits approach={sport.content.approach} benefits={sport.content.benefits} />
            <TrainingAndPathways videos={sport.content.videos} pathways={sport.content.pathways} />
          </>
        );
      }}
    </QueryState>
  );
}
