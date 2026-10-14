import { Card, CardHeader } from '../../../components/Card/Card.jsx';
import { ComparisonBar } from '../../../components/ComparisonBar/ComparisonBar.jsx';
import { formatStat } from '../../../lib/match.js';
import styles from './MatchPage.module.css';

export function MatchStatsTab({ match }) {
  const { turi, opponent } = match.teamStats;
  const rows = match.sport.teamStats.filter((d) => turi[d.key] != null || opponent[d.key] != null);
  return (
    <Card>
      <CardHeader title="Match Details Summary" icon="analytics" />
      <div className={styles.legend} aria-hidden="true">
        <span className={styles.turiKey}>Turi</span>
        <span className={styles.opponentKey}>{match.opponent.shortName}</span>
      </div>
      <div className={styles.comparisons}>
        {rows.length === 0 && <p>No team stats were recorded for this match.</p>}
        {rows.map((d) => {
          const [left, right] = [turi[d.key] ?? 0, opponent[d.key] ?? 0];
          return (
            <ComparisonBar
              key={d.key}
              label={d.label}
              icon={d.icon}
              left={left}
              right={right}
              leftText={formatStat(left, d)}
              rightText={formatStat(right, d)}
            />
          );
        })}
      </div>
    </Card>
  );
}
