import { Link } from 'react-router';
import { Card } from '../../../components/Card/Card.jsx';
import { DataTable } from '../../../components/DataTable/DataTable.jsx';
import { Icon } from '../../../components/Icon/Icon.jsx';
import { useHomeSchool } from '../../../hooks/schools.js';
import { formatDate } from '../../../lib/dates.js';
import styles from './SeasonStatsPage.module.css';

const RECORDS = {
  scoringPeak: { label: 'Scoring peak', icon: 'military_tech' },
  dominantWin: { label: 'Dominant win', icon: 'star' },
  defensiveStruggle: { label: 'Defensive struggle', icon: 'shield' },
};

export function PerformanceTab({ stats, sport, unit }) {
  const school = useHomeSchool();
  const columns = [
    {
      key: 'category',
      header: 'Category',
      isRowHeader: true,
      render: (r) => (
        <span className={styles.record}>
          <Icon name={RECORDS[r.key].icon} className={styles.recordIcon} />
          {RECORDS[r.key].label}
        </span>
      ),
    },
    { key: 'value', header: unit, align: 'center', render: (r) => <strong>{r.key === 'dominantWin' ? `+${r.value}` : r.value}</strong> },
    {
      key: 'match',
      header: 'Match',
      render: (r) => (
        <Link to={`/${sport}/schedule/${r.match.id}`}>
          {`${school.data?.shortName ?? 'Turi'} ${r.match.score.turi}–${r.match.score.opponent} ${r.match.opponent.name}`}
        </Link>
      ),
    },
    { key: 'date', header: 'Date', render: (r) => formatDate(r.match.kickoffAt) },
  ];
  return (
    <Card>
      <DataTable caption="Season records" columns={columns} rows={stats.records} rowKey={(r) => r.key} headerTone="navy" empty="No published results yet this season." />
    </Card>
  );
}
