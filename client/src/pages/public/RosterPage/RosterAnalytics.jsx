import { Card, CardHeader } from '../../../components/Card/Card.jsx';
import { DataTable } from '../../../components/DataTable/DataTable.jsx';
import { DonutChart } from '../../../components/DonutChart/DonutChart.jsx';
import { Icon } from '../../../components/Icon/Icon.jsx';
import { ShareMeter } from '../../../components/ShareMeter/ShareMeter.jsx';
import styles from './RosterPage.module.css';

const METRICS = { girls: 'Girl players', new: 'New players', returning: 'Returning players' };

function Change({ current, previous }) {
  if (!previous) return '—';
  const change = Math.round(((current - previous) / previous) * 100);
  const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
  return (
    <span className={styles[direction]}>
      <Icon name={`trending_${direction}`} size="sm" /> {change > 0 ? '+' : ''}
      {change}%
    </span>
  );
}

const columns = [
  { key: 'metric', header: 'Metric', isRowHeader: true, render: (r) => METRICS[r.metric] },
  { key: 'current', header: 'Current season', align: 'center' },
  { key: 'previous', header: 'Last season', align: 'center', render: (r) => r.previous ?? '—' },
  { key: 'change', header: 'Change', align: 'end', render: (r) => <Change {...r} /> },
];

export function RosterAnalytics({ analytics }) {
  const { female, male } = analytics.gender;
  const total = female + male || 1;
  return (
    <div className={styles.analytics}>
      <Card>
        <CardHeader title="Academy Player Distribution" />
        <div className={styles.cardBody}>
          <DonutChart
            label="Share of the sport's players by team"
            centerValue="100%"
            centerLabel="TOTAL"
            segments={analytics.academy.map((a) => ({ label: a.team.name, value: a.share, detail: `${a.share}% of academy · ${a.playerCount} players` }))}
          />
        </div>
      </Card>
      <Card>
        <CardHeader title="Gender Distribution" />
        <div className={styles.cardBody}>
          <ShareMeter label="Female players" icon="female" percent={Math.round((female / total) * 100)} detail={`${female} players`} />
          <ShareMeter label="Male players" icon="male" tone="gold" percent={Math.round((male / total) * 100)} detail={`${male} players`} />
        </div>
      </Card>
      <Card className={styles.wide}>
        <CardHeader title="Seasonal Roster Analytics" />
        <DataTable caption="This season compared with last season" columns={columns} rows={analytics.comparison} rowKey={(r) => r.metric} headerTone="navy" />
      </Card>
    </div>
  );
}
