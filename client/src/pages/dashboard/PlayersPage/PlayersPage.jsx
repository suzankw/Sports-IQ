import { Avatar } from '../../../components/Avatar/Avatar.jsx';
import { ResourceScreen } from '../../../components/ResourceScreen/ResourceScreen.jsx';
import { Select } from '../../../components/Select/Select.jsx';
import { TextInput } from '../../../components/TextInput/TextInput.jsx';
import { useMe } from '../../../hooks/auth.js';
import { useList, useResource } from '../../../hooks/resources.js';
import { useUrlState } from '../../../hooks/useUrlState.js';
import { PLAYER_GENDERS, fullName } from '../../../lib/people.js';
import { newestFirst, optionsOf, teamSeasonLabel } from '../../../lib/options.js';
import { PlayerForm } from './PlayerForm.jsx';
import styles from './PlayersPage.module.css';

const columns = [
  {
    key: 'name',
    header: 'Player',
    isRowHeader: true,
    render: (p) => (
      <span className={styles.player}>
        <Avatar src={p.photoUrl} name={fullName(p)} size="sm" />
        {fullName(p)}
      </span>
    ),
  },
  { key: 'gender', header: 'Gender', render: (p) => PLAYER_GENDERS.find((g) => g.value === p.gender).label },
];

/** D11 Players. Coaches work within their own squads; admins see everyone. */
export function PlayersPage() {
  const me = useMe().data;
  const isAdmin = me.user.role === 'admin';
  const own = newestFirst(me.permissions.teamSeasons);
  const [url, setUrl] = useUrlState({ q: '', teamSeason: isAdmin ? '' : (own[0]?.id ?? '') });
  const all = useList('/team-seasons', {}, { enabled: isAdmin });
  const teams = isAdmin ? [{ value: '', label: 'All players' }, ...optionsOf(all.data, teamSeasonLabel)] : optionsOf(own, teamSeasonLabel);
  const search = url.q.trim().length >= 2 ? url.q.trim() : undefined;
  const query = useList('/players', { search, teamSeason: url.teamSeason || undefined });
  return (
    <ResourceScreen
      title="Players"
      subtitle={isAdmin ? 'Every pupil who has played for Turi. Add them to a squad in Rosters.' : 'Players in your squads. New players join a squad in Rosters.'}
      noun="player"
      nameOf={fullName}
      filters={
        <>
          <TextInput label="Search" icon="search" placeholder="First or last name" value={url.q} onChange={(e) => setUrl({ q: e.target.value }, { replace: true })} />
          <Select label="Team" options={teams} value={url.teamSeason} onChange={(e) => setUrl({ teamSeason: e.target.value })} />
        </>
      }
      query={query}
      resource={useResource('/players')}
      columns={columns}
      Form={PlayerForm}
      canDelete={() => isAdmin}
    >
      {query.data?.length === 200 && <p className={styles.more}>Showing the first 200 — search to find others.</p>}
    </ResourceScreen>
  );
}
