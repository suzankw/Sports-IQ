import { lazy, Suspense } from 'react';
import { Card, CardHeader } from '../../../components/Card/Card.jsx';
import { Leaderboard } from '../../../components/Leaderboard/Leaderboard.jsx';
import { StatCard } from '../../../components/StatCard/StatCard.jsx';
import { scoreUnit } from '../../../lib/scoring.js';
import styles from './SeasonStatsPage.module.css';

// Recharts is only needed here, so it loads with this tab.
const TeamFormChart = lazy(() => import('../../../components/TeamFormChart/TeamFormChart.jsx').then((m) => ({ default: m.TeamFormChart })));

function Kpis({ kpis, sport }) {
  const teamStat = sport.teamStats.find((d) => d.key === kpis.teamStat?.key);
  const { word } = scoreUnit(sport);
  return (
    <div className={styles.kpis}>
      <StatCard label="Win rate" value={`${kpis.winRate}%`} change={kpis.winRateChange} changeLabel={kpis.winRateChange !== null && `${kpis.winRateChange > 0 ? '+' : ''}${kpis.winRateChange} pts`} />
      <StatCard label={`Total ${word.toLowerCase()}`} value={kpis.scored} accent="gold" />
      {kpis.cleanSheets !== null && <StatCard label="Clean sheets" value={kpis.cleanSheets} />}
      {teamStat && (
        <StatCard
          label={`${teamStat.aggregation === 'avg' ? 'Avg. ' : ''}${teamStat.label}`}
          value={`${kpis.teamStat.value}${teamStat.type === 'percent' ? '%' : ''}`}
          accent="gold"
        />
      )}
    </div>
  );
}

export function OverviewTab({ stats, sport }) {
  const statLabel = stats.kpis.teamStat ? sport.teamStats.find((d) => d.key === stats.kpis.teamStat.key)?.label : null;
  const { difference } = scoreUnit(sport);
  return (
    <div className={styles.tab}>
      <Kpis kpis={stats.kpis} sport={sport} />
      <Card>
        <CardHeader
          title={`Team Form (last ${stats.form.length} matches)`}
          icon="trending_up"
          actions={
            <p className={styles.legend} aria-hidden="true">
              {statLabel && <span className={styles.statKey}>{statLabel}</span>}
              <span className={styles.gdKey}>{difference}</span>
            </p>
          }
        />
        {stats.form.length === 0 ? (
          <p className={styles.empty}>No published results yet this season.</p>
        ) : (
          <Suspense fallback={<p className={styles.empty}>Loading chart…</p>}>
            <TeamFormChart form={stats.form} statLabel={statLabel} differenceLabel={difference} />
          </Suspense>
        )}
      </Card>
      <h2 className={styles.sectionTitle}>Player Leaderboards</h2>
      <div className={styles.boards}>
        {stats.leaderboards
          .filter((b) => b.group !== 'discipline')
          .map((board) => (
            <Leaderboard key={board.key} board={board} compact limit={3} />
          ))}
      </div>
    </div>
  );
}
