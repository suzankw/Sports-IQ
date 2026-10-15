import { Checkbox } from '../../../components/Checkbox/Checkbox.jsx';
import { QueryState } from '../../../components/QueryState/QueryState.jsx';
import { ResourceForm } from '../../../components/ResourceForm/ResourceForm.jsx';
import { Select } from '../../../components/Select/Select.jsx';
import { TextInput } from '../../../components/TextInput/TextInput.jsx';
import { useList } from '../../../hooks/resources.js';
import { useTeamSeason } from '../../../hooks/teamSeasons.js';
import { optionsOf } from '../../../lib/options.js';

/** Enter a team in a season (item null) or edit its league and season quote (item = the team-season). */
function TeamSeasonForm({ item, team, season, last, ...props }) {
  const leagues = useList('/competitions', { sport: team.sport.slug, type: 'league' });
  return (
    <ResourceForm
      item={item}
      {...props}
      defaultValues={{
        leagueCompetition: item ? (item.leagueCompetition?.id ?? '') : (last?.leagueCompetition?.id ?? ''),
        seasonQuote: { text: item?.seasonQuote?.text ?? '', attribution: item?.seasonQuote?.attribution ?? '' },
        copy: Boolean(last),
      }}
      toBody={({ leagueCompetition, seasonQuote, copy }) => {
        const changes = { leagueCompetition: leagueCompetition || null, seasonQuote: seasonQuote.text ? seasonQuote : null };
        if (item) return { version: item.version, ...changes };
        return { team: team.id, season: season.id, ...changes, ...(copy && last ? { copyFrom: last.id } : {}) };
      }}
    >
      {({ register, formState: { errors } }) => (
        <>
          <Select label="League" hint="Its table shows on the public League Table page" options={[{ value: '', label: 'No league' }, ...optionsOf(leagues.data)]} error={errors.leagueCompetition?.message} {...register('leagueCompetition')} />
          <TextInput label="Season quote" multiline rows={3} hint="Optional — shown on the Roster and Season Stats pages" error={errors.seasonQuote?.text?.message} {...register('seasonQuote.text')} />
          <TextInput
            label="Quote by"
            placeholder="Head Coach"
            error={errors.seasonQuote?.attribution?.message}
            {...register('seasonQuote.attribution', { validate: (value, values) => !values.seasonQuote.text || Boolean(value) || 'Say who said it' })}
          />
          {!item && last && <Checkbox label={`Copy the squad from ${last.season.label}`} hint={`${last.memberCount} players. Shirt numbers and positions can be changed in Rosters.`} {...register('copy')} />}
        </>
      )}
    </ResourceForm>
  );
}

/** Editing needs the full team-season (version, quote); entering doesn't. */
export function TeamSeasonDialogBody({ teamSeason, ...props }) {
  const full = useTeamSeason(teamSeason?.id);
  if (!teamSeason) return <TeamSeasonForm item={null} {...props} />;
  return <QueryState query={full}>{(item) => <TeamSeasonForm item={item} {...props} />}</QueryState>;
}
