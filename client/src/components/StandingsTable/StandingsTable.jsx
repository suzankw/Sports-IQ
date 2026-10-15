import { cx } from '../../lib/cx.js';
import { Avatar } from '../Avatar/Avatar.jsx';
import { FormPill } from '../Badge/Badge.jsx';
import { DataTable } from '../DataTable/DataTable.jsx';
import styles from './StandingsTable.module.css';

const signed = (n) => (n > 0 ? `+${n}` : String(n));

/** League table rows; `compact` (overview widget) shows position, school and points only. */
export function StandingsTable({ rows, unit, compact }) {
  const columns = [
    { key: 'position', header: 'Pos', align: 'center', render: (r) => <span className={styles.position}>{r.position}</span> },
    {
      key: 'school',
      header: 'Club',
      isRowHeader: true,
      render: (r) => (
        <span className={styles.club}>
          {!compact && <Avatar src={r.school.crestUrl} name={r.school.name} size="sm" shape="square" tone="neutral" />}
          <span className={cx(r.isHome && styles.home)}>{compact ? r.school.shortName : r.school.name}</span>
        </span>
      ),
    },
    ...(compact
      ? []
      : [
          { key: 'played', header: 'P', align: 'center' },
          { key: 'won', header: 'W', align: 'center' },
          { key: 'drawn', header: 'D', align: 'center' },
          { key: 'lost', header: 'L', align: 'center' },
          { key: 'goalsFor', header: unit.for, align: 'center' },
          { key: 'goalsAgainst', header: unit.against, align: 'center' },
          { key: 'goalDifference', header: 'GD', align: 'center', render: (r) => <span className={cx(r.goalDifference > 0 && styles.positive)}>{signed(r.goalDifference)}</span> },
        ]),
    { key: 'points', header: 'Pts', align: 'center', render: (r) => <strong className={styles.points}>{r.points}</strong> },
    ...(compact ? [] : [{ key: 'form', header: 'Form', align: 'center', render: (r) => <span className={styles.form}>{r.form.map((x, i) => <FormPill key={i} result={x} />)}</span> }]),
  ];
  return <DataTable caption="League standings" columns={columns} rows={rows} rowKey={(r) => r.school.id} isHighlighted={(r) => r.position === 1} dense={compact} />;
}
