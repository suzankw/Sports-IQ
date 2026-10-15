import { useState } from 'react';
import { Badge } from '../../../components/Badge/Badge.jsx';
import { Button } from '../../../components/Button/Button.jsx';
import { Card, CardHeader } from '../../../components/Card/Card.jsx';
import { DataTable } from '../../../components/DataTable/DataTable.jsx';
import { ConfirmDialog } from '../../../components/Dialog/ConfirmDialog.jsx';
import { Dialog } from '../../../components/Dialog/Dialog.jsx';
import { Select } from '../../../components/Select/Select.jsx';
import { useToast } from '../../../components/Toast/Toast.jsx';
import { useList, useResource } from '../../../hooks/resources.js';
import { useSeasons } from '../../../hooks/seasons.js';
import { useUrlState } from '../../../hooks/useUrlState.js';
import { TeamSeasonDialogBody } from './TeamSeasonForm.jsx';
import styles from './TeamsPage.module.css';

/** D6 "Teams in season": enter a team (league, quote, copy last squad), edit it or take it out. */
export function TeamsInSeason({ sport, teams }) {
  const [url, setUrl] = useUrlState({ season: '' });
  const seasons = useSeasons().data ?? [];
  const index = seasons.findIndex((s) => (url.season ? s.slug === url.season : s.isCurrent));
  const [season, previous] = [seasons[index], seasons[index + 1]]; // newest first
  const entered = useList('/team-seasons', { sport, season: season?.slug }, { enabled: Boolean(season) }).data ?? [];
  const before = useList('/team-seasons', { sport, season: previous?.slug }, { enabled: Boolean(previous) }).data ?? [];
  const resource = useResource('/team-seasons');
  const toast = useToast();
  const [open, setOpen] = useState(null); // { team, teamSeason }
  const [removing, setRemoving] = useState(null);

  const rows = teams.map((team) => ({ team, teamSeason: entered.find((ts) => ts.team.id === team.id), last: before.find((ts) => ts.team.id === team.id) }));
  const remove = async () => {
    try {
      await resource.remove.mutateAsync(removing.teamSeason.id);
      toast(`${removing.team.name} removed from ${season.label}`);
    } catch (error) {
      toast(error.message, 'error');
    }
    setRemoving(null);
  };
  const columns = [
    { key: 'team', header: 'Team', isRowHeader: true, render: (r) => `${r.team.name} · ${r.team.sport.name}` },
    { key: 'league', header: 'League', render: (r) => (r.teamSeason ? (r.teamSeason.leagueCompetition?.shortName ?? 'None') : '—') },
    { key: 'squad', header: 'Squad', align: 'end', render: (r) => r.teamSeason?.memberCount ?? '—' },
    {
      key: 'actions',
      header: <span className="visually-hidden">Actions</span>,
      align: 'end',
      render: (r) =>
        r.teamSeason ? (
          <div className={styles.rowActions}>
            <Badge tone="positive">Entered</Badge>
            <Button variant="ghost" size="sm" icon="edit" title="Edit" aria-label={`Edit ${r.team.name} in ${season.label}`} onClick={() => setOpen(r)} />
            <Button variant="ghost" size="sm" icon="delete" title="Remove" aria-label={`Remove ${r.team.name} from ${season.label}`} onClick={() => setRemoving(r)} />
          </div>
        ) : (
          <Button variant="outline" size="sm" icon="add" onClick={() => setOpen(r)}>
            Enter in season
          </Button>
        ),
    },
  ];

  return (
    <Card className={styles.inSeason}>
      <CardHeader
        title="Teams in season"
        icon="calendar_month"
        actions={<Select label="Season" hideLabel value={season?.slug ?? ''} options={seasons.map((s) => ({ value: s.slug, label: s.label }))} onChange={(e) => setUrl({ season: seasons.find((s) => s.slug === e.target.value)?.isCurrent ? '' : e.target.value })} />}
      />
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.team.id} caption={`Teams in ${season?.label ?? 'the season'}`} empty="Add a team first." />
      <Dialog open={Boolean(open)} onClose={() => setOpen(null)} title={open && `${open.team.name} · ${season.label}`}>
        {open && <TeamSeasonDialogBody {...open} season={season} resource={resource} onCancel={() => setOpen(null)} onSaved={() => {
              toast(`Saved ${open.team.name} for ${season.label}`);
              setOpen(null);
            }} />}
      </Dialog>
      <ConfirmDialog
        open={Boolean(removing)}
        title="Remove from season?"
        message={removing && `${removing.team.name} will be taken out of ${season.label}, with its squad. Teams with fixtures or coaches can't be removed.`}
        confirmLabel="Remove"
        busy={resource.remove.isPending}
        onConfirm={remove}
        onCancel={() => setRemoving(null)}
      />
    </Card>
  );
}
