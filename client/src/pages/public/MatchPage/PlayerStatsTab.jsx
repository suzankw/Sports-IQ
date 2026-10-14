import { useState } from 'react';
import { Avatar } from '../../../components/Avatar/Avatar.jsx';
import { Card, CardHeader } from '../../../components/Card/Card.jsx';
import { DataTable } from '../../../components/DataTable/DataTable.jsx';
import { Icon } from '../../../components/Icon/Icon.jsx';
import { PerformerCard } from '../../../components/PerformerCard/PerformerCard.jsx';
import { TextInput } from '../../../components/TextInput/TextInput.jsx';
import { formatStat } from '../../../lib/match.js';
import { fullName, positionNames } from '../../../lib/people.js';
import styles from './MatchPage.module.css';

function statColumns(definitions) {
  return definitions.map((d) => ({
    key: d.key,
    header: <abbr title={d.label}>{d.abbr}</abbr>,
    align: 'center',
    render: (row) => formatStat(row.stats[d.key] ?? 0, d),
  }));
}

export function PlayerStatsTab({ match }) {
  const [search, setSearch] = useState('');
  const positions = positionNames(match.sport);
  const definitions = Object.fromEntries(match.sport.playerStats.map((d) => [d.key, d]));
  const headline = Object.fromEntries(match.sport.positions.map((p) => [p.key, p.headlineStats]));
  const rowOf = new Map(match.playerStats.map((row) => [row.player.id, row]));
  const star = match.topPerformers[0]?.id;

  const rows = match.playerStats.filter((row) => fullName(row.player).toLowerCase().includes(search.trim().toLowerCase()));
  const columns = [
    { key: 'number', header: '#', render: (row) => row.number ?? '–' },
    {
      key: 'player',
      header: 'Player',
      isRowHeader: true,
      render: (row) => (
        <span className={styles.player}>
          <Avatar src={row.player.photoUrl} name={fullName(row.player)} size="sm" />
          {row.player.shortName}
          {row.player.id === match.captain?.id && ' (C)'}
          {row.player.id === star && <Icon name="star" size="sm" filled label="Player of the match" className={styles.star} />}
        </span>
      ),
    },
    { key: 'position', header: 'Pos', render: (row) => row.position },
    ...statColumns(match.sport.playerStats),
  ];

  return (
    <div className={styles.playerStats}>
      {match.topPerformers.length > 0 && (
        <section aria-labelledby="top-performers">
          <h2 id="top-performers" className={styles.sectionTitle}>
            <Icon name="star" filled className={styles.star} /> Top Performers
          </h2>
          <div className={styles.performers}>
            {match.topPerformers.map((player) => {
              const row = rowOf.get(player.id);
              const stats = (headline[row?.position] ?? []).map((key) => ({ label: definitions[key].label, value: formatStat(row.stats[key] ?? 0, definitions[key]) }));
              return <PerformerCard key={player.id} player={player} position={positions[row?.position] ?? ''} stats={stats} />;
            })}
          </div>
        </section>
      )}
      <Card>
        <CardHeader title="Full Squad Statistics" icon="list_alt" actions={<TextInput label="Search players" hideLabel icon="search" placeholder="Search player…" value={search} onChange={(e) => setSearch(e.target.value)} />} />
        <DataTable caption="Player statistics for this match" columns={columns} rows={rows} rowKey={(row) => row.player.id} headerTone="navy" empty="No players match that search." />
      </Card>
    </div>
  );
}
