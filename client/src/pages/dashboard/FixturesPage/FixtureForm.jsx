import { useWatch } from 'react-hook-form';
import { QueryState } from '../../../components/QueryState/QueryState.jsx';
import { ResourceForm } from '../../../components/ResourceForm/ResourceForm.jsx';
import formStyles from '../../../components/ResourceForm/ResourceForm.module.css';
import { Select } from '../../../components/Select/Select.jsx';
import { DateTimeInput, TextInput } from '../../../components/TextInput/TextInput.jsx';
import { useMatch } from '../../../hooks/matches.js';
import { useList } from '../../../hooks/resources.js';
import { bind } from '../../../lib/forms.js';
import { fromEatInput, toEatInput } from '../../../lib/dates.js';
import { optionsOf, teamSeasonLabel } from '../../../lib/options.js';

const HOME_AWAY = [
  { value: 'home', label: 'Home' },
  { value: 'away', label: 'Away' },
];

/** Competitions follow the chosen team's sport. */
function CompetitionSelect({ form, teamSeasons }) {
  const chosen = useWatch({ control: form.control, name: 'teamSeason' });
  const sport = teamSeasons.find((ts) => ts.id === chosen)?.sport.slug;
  const competitions = useList('/competitions', { sport }, { enabled: Boolean(sport) });
  return (
    <Select label="Competition" placeholder="Choose a competition" options={optionsOf(competitions.data)} {...bind(form, 'competition', { required: 'Choose a competition' })} />
  );
}

function FixtureForm({ item, teamSeasons, defaultTeamSeason, ...props }) {
  const schools = useList('/schools', { home: false });
  // A fixture from an older season keeps its own team in the list.
  const teams = item && !teamSeasons.some((ts) => ts.id === item.teamSeason) ? [...teamSeasons, { ...item, id: item.teamSeason }] : teamSeasons;
  return (
    <ResourceForm
      item={item}
      {...props}
      defaultValues={{
        teamSeason: item?.teamSeason ?? defaultTeamSeason ?? '',
        competition: item?.competition.id ?? '',
        round: item?.round ?? '',
        opponent: item?.opponent.id ?? '',
        homeAway: item?.homeAway ?? 'home',
        kickoffAt: item ? toEatInput(item.kickoffAt) : '',
        venue: item?.venue ?? '',
      }}
      toBody={({ round, venue, kickoffAt, ...values }) => ({
        ...(item ? { version: item.version } : {}),
        ...values,
        round: round || null,
        venue: venue || null,
        kickoffAt: fromEatInput(kickoffAt),
      })}
    >
      {(form) => (
        <>
          <Select label="Team" placeholder="Choose a team" options={optionsOf(teams, teamSeasonLabel)} {...bind(form, 'teamSeason', { required: 'Choose a team' })} />
          <CompetitionSelect form={form} teamSeasons={teams} />
          <TextInput label="Round" placeholder="Matchday 4, Semi-final… (optional)" {...bind(form, 'round')} />
          <div className={formStyles.pair}>
            <Select label="Opponent" placeholder="Choose a school" options={optionsOf(schools.data)} {...bind(form, 'opponent', { required: 'Choose the opponent' })} />
            <Select label="Turi plays" options={HOME_AWAY} {...bind(form, 'homeAway')} />
          </div>
          <DateTimeInput label="Kick-off" {...bind(form, 'kickoffAt', { required: 'Choose the date and time' })} />
          <TextInput label="Venue" placeholder="Turi Main Pitch (optional)" {...bind(form, 'venue')} />
        </>
      )}
    </ResourceForm>
  );
}

/** Editing needs the full match (its version); adding doesn't. */
export function FixtureDialogBody({ item, ...props }) {
  const full = useMatch(item?.id);
  if (!item) return <FixtureForm item={null} {...props} />;
  return <QueryState query={full}>{(match) => <FixtureForm item={match} {...props} />}</QueryState>;
}
