import { PageHeader } from '../../../components/PageHeader/PageHeader.jsx';
import { QueryState } from '../../../components/QueryState/QueryState.jsx';
import { Select } from '../../../components/Select/Select.jsx';
import { useMe } from '../../../hooks/auth.js';
import { useList } from '../../../hooks/resources.js';
import { useSport } from '../../../hooks/sports.js';
import { useTeamSeason } from '../../../hooks/teamSeasons.js';
import { useUrlState } from '../../../hooks/useUrlState.js';
import { newestFirst, optionsOf, teamSeasonLabel } from '../../../lib/options.js';
import { SquadEditor } from './SquadEditor.jsx';
import styles from './RostersPage.module.css';

/** Waits for the sport (positions); the editor restarts after each save (new version). */
function SquadLoader({ id }) {
  const teamSeason = useTeamSeason(id);
  const sport = useSport(teamSeason.data?.sport.slug);
  return (
    <QueryState query={teamSeason.isSuccess ? sport : teamSeason}>
      {() => <SquadEditor key={teamSeason.data.version} teamSeason={teamSeason.data} sport={sport.data} reload={() => teamSeason.refetch()} />}
    </QueryState>
  );
}

/** D12 Roster editor. Coaches pick from their own teams; admins from every team this season. */
export function RostersPage() {
  const me = useMe().data;
  const isAdmin = me.user.role === 'admin';
  const all = useList('/team-seasons', {}, { enabled: isAdmin });
  const choices = isAdmin ? (all.data ?? []) : newestFirst(me.permissions.teamSeasons);
  const [url, setUrl] = useUrlState({ teamSeason: '' });
  const id = url.teamSeason || choices[0]?.id;
  return (
    <>
      <title>Rosters · Sports IQ</title>
      <PageHeader title="Rosters" subtitle="Each squad's players, shirt numbers, positions and captain. Changes show on the public Roster page." />
      <div className={styles.filters}>
        <Select label="Team" options={optionsOf(choices, teamSeasonLabel)} value={id ?? ''} onChange={(e) => setUrl({ teamSeason: e.target.value })} />
      </div>
      {id ? <SquadLoader key={id} id={id} /> : <p>{isAdmin ? 'Enter a team in this season first (Teams).' : "You aren't assigned to a team yet."}</p>}
    </>
  );
}
