import { useParams } from 'react-router';
import { Button } from '../../../components/Button/Button.jsx';
import { PageHeader } from '../../../components/PageHeader/PageHeader.jsx';
import { QueryState } from '../../../components/QueryState/QueryState.jsx';
import { Quote } from '../../../components/Quote/Quote.jsx';
import { Scoreboard } from '../../../components/Scoreboard/Scoreboard.jsx';
import { ShareButton } from '../../../components/ShareButton/ShareButton.jsx';
import { TabPanel, Tabs } from '../../../components/Tabs/Tabs.jsx';
import { useMatch } from '../../../hooks/matches.js';
import { useUrlState } from '../../../hooks/useUrlState.js';
import { fixtureTitle, kickoffText, scorerLines, sidesOf, STATUS_LABELS } from '../../../lib/match.js';
import { LineupsTab } from './LineupsTab.jsx';
import { MatchNotice } from './MatchNotice.jsx';
import { MatchStatsTab } from './MatchStatsTab.jsx';
import { PlayerStatsTab } from './PlayerStatsTab.jsx';

const TABS = [
  { id: 'lineups', label: 'Lineups' },
  { id: 'stats', label: 'Stats' },
  { id: 'players', label: 'Player Stats' },
];

function MatchView({ match, tab, onTab }) {
  const hasResult = Boolean(match.events);
  const title = `${match.team.name} vs ${match.opponent.shortName}`;
  return (
    <>
      <title>{`${title} · Match Statistics · Sports IQ`}</title>
      <PageHeader
        eyebrow={`${match.team.name} ${match.sport.name}`}
        title="Match Statistics"
        subtitle={fixtureTitle(match)}
        actions={
          hasResult && (
            <>
              <Button variant="outline" icon="picture_as_pdf" onClick={() => window.print()}>
                Export PDF
              </Button>
              <ShareButton title={title} />
            </>
          )
        }
      />
      <Scoreboard
        sides={sidesOf(match)}
        score={match.score}
        status={STATUS_LABELS[match.status]}
        live={match.status === 'live'}
        when={kickoffText(match)}
        scorers={{ turi: scorerLines(match, 'turi'), opponent: scorerLines(match, 'opponent') }}
      >
        {hasResult && <Tabs label="Match sections" items={TABS} value={tab} onChange={onTab} />}
      </Scoreboard>
      {!hasResult && <MatchNotice status={match.status} />}
      {hasResult && (
        <>
          <TabPanel id="lineups" hidden={tab !== 'lineups'}>
            <LineupsTab match={match} />
          </TabPanel>
          <TabPanel id="stats" hidden={tab !== 'stats'}>
            <MatchStatsTab match={match} />
          </TabPanel>
          <TabPanel id="players" hidden={tab !== 'players'}>
            <PlayerStatsTab match={match} />
          </TabPanel>
          {match.report && <Quote text={match.report.text} attribution={match.report.attribution} />}
        </>
      )}
    </>
  );
}

export function MatchPage() {
  const { matchId } = useParams();
  const match = useMatch(matchId);
  const [{ tab }, setUrl] = useUrlState({ tab: 'stats' });
  return <QueryState query={match}>{(data) => <MatchView match={data} tab={tab} onTab={(next) => setUrl({ tab: next })} />}</QueryState>;
}
