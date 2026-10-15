import { Card, CardHeader } from '../Card/Card.jsx';
import { DataTable } from '../DataTable/DataTable.jsx';

const ORDINALS = ['Starter', '1st Sub', '2nd Sub', '3rd Sub', '4th Sub', '5th Sub'];

/** rows: [{ position, players: [PlayerRef] }] in starter-first order. */
export function DepthChart({ rows }) {
  const depth = Math.max(1, ...rows.map((r) => r.players.length));
  const columns = [
    { key: 'position', header: 'Pos', isRowHeader: true },
    ...ORDINALS.slice(0, depth).map((label, i) => ({ key: label, header: label, render: (row) => row.players[i]?.shortName ?? '—' })),
  ];
  return (
    <Card>
      <CardHeader title="Depth Chart" />
      <DataTable caption="Depth chart" columns={columns} rows={rows} rowKey={(r) => r.position} headerTone="navy" />
    </Card>
  );
}
