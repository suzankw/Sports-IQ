import { fullName } from '../../lib/people.js';
import { Avatar } from '../Avatar/Avatar.jsx';
import { Card, CardHeader } from '../Card/Card.jsx';
import { DataTable } from '../DataTable/DataTable.jsx';
import { Icon } from '../Icon/Icon.jsx';
import styles from './Leaderboard.module.css';

const PlayerCell = ({ row }) => (
  <span className={styles.player}>
    <Avatar src={row.player.photoUrl} name={fullName(row.player)} size="sm" />
    {row.player.shortName}
  </span>
);

/**
 * A ranked list. `compact` (Season overview, top 3): name + big number.
 * Otherwise a table with rank, player, appearances (P) and the value (`valueHeader`).
 */
export function Leaderboard({ board, compact, valueHeader, limit = 10 }) {
  const rows = board.rows.slice(0, limit);
  if (compact) {
    return (
      <Card accent={board.group === 'attack' ? 'gold' : undefined}>
        <header className={styles.compactHeader}>
          <h3 className={styles.compactTitle}>{board.label}</h3>
          <Icon name={board.icon} className={styles.icon} />
        </header>
        {rows.length === 0 && <p className={styles.empty}>No results yet.</p>}
        <ol className={styles.list}>
          {rows.map((row) => (
            <li key={row.player.id} className={styles.item}>
              <span className={styles.rank}>{row.rank}</span>
              <PlayerCell row={row} />
              <span className={row.rank === 1 ? styles.leader : styles.value}>{row.value}</span>
            </li>
          ))}
        </ol>
      </Card>
    );
  }
  const columns = [
    { key: 'rank', header: 'Rank', render: (r) => <span className={styles.rank}>{r.rank}</span> },
    { key: 'player', header: 'Player', isRowHeader: true, render: (r) => <PlayerCell row={r} /> },
    { key: 'appearances', header: <abbr title="Appearances">P</abbr>, align: 'center' },
    { key: 'value', header: valueHeader, align: 'center', render: (r) => <strong className={styles.tableValue}>{r.value}</strong> },
  ];
  return (
    <Card>
      <CardHeader title={board.label} icon={board.icon} tone="dark" />
      <DataTable caption={board.label} columns={columns} rows={rows} rowKey={(r) => r.player.id} empty="No results yet." />
    </Card>
  );
}
