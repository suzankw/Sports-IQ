import { ResourceForm } from '../../../components/ResourceForm/ResourceForm.jsx';
import formStyles from '../../../components/ResourceForm/ResourceForm.module.css';
import { ResourceScreen } from '../../../components/ResourceScreen/ResourceScreen.jsx';
import { Select } from '../../../components/Select/Select.jsx';
import { NumberInput, TextInput } from '../../../components/TextInput/TextInput.jsx';
import { useList, useResource } from '../../../hooks/resources.js';
import { useSeasons } from '../../../hooks/seasons.js';
import { useUrlState } from '../../../hooks/useUrlState.js';
import { formatDate, fromEatInput, toEatInput } from '../../../lib/dates.js';
import { bind } from '../../../lib/forms.js';
import { optionsOf } from '../../../lib/options.js';

const resultText = (r) => `${r.home.school.shortName} ${r.home.score}–${r.away.score} ${r.away.school.shortName}`;
const columns = [
  { key: 'date', header: 'Date', render: (r) => formatDate(r.playedAt) },
  { key: 'result', header: 'Result', isRowHeader: true, render: resultText },
  { key: 'competition', header: 'League', render: (r) => r.competition.shortName },
];
const leagueLabel = (c) => `${c.name} · ${c.sport.name}`;

function SideFields({ form, side, label, schools }) {
  return (
    <div className={formStyles.pair}>
      <Select label={label} placeholder="Choose a school" options={schools} {...bind(form, `${side}.school`, { required: 'Choose the school' })} />
      <NumberInput label="Score" {...bind(form, `${side}.score`, { valueAsNumber: true, required: 'Enter the score' })} />
    </div>
  );
}

function LeagueResultForm({ item, competitionId, seasonId, ...props }) {
  const leagues = useList('/competitions', { type: 'league' });
  const schools = optionsOf(useList('/schools', { home: false }).data);
  const seasons = useSeasons();
  return (
    <ResourceForm
      item={item}
      {...props}
      defaultValues={{
        competition: item?.competition.id ?? competitionId ?? '',
        season: item?.season.id ?? seasonId ?? '',
        playedAt: item ? toEatInput(item.playedAt).slice(0, 10) : '',
        home: { school: item?.home.school.id ?? '', score: item?.home.score ?? '' },
        away: { school: item?.away.school.id ?? '', score: item?.away.score ?? '' },
      }}
      toBody={({ competition, season, playedAt, ...sides }) => ({ ...(item ? {} : { competition, season }), playedAt: fromEatInput(`${playedAt}T12:00`), ...sides })}
    >
      {(form) => (
        <>
          {!item && (
            <div className={formStyles.pair}>
              <Select label="League" placeholder="Choose a league" options={optionsOf(leagues.data, leagueLabel)} {...bind(form, 'competition', { required: 'Choose the league' })} />
              <Select label="Season" options={optionsOf(seasons.data, (s) => s.label)} {...bind(form, 'season', { required: 'Choose the season' })} />
            </div>
          )}
          <TextInput label="Date played" type="date" {...bind(form, 'playedAt', { required: 'Choose the date' })} />
          <SideFields form={form} side="home" label="Home school" schools={schools} />
          <SideFields form={form} side="away" label="Away school" schools={schools} />
        </>
      )}
    </ResourceForm>
  );
}

/** D15 Other schools' league results — they complete the league tables. */
export function LeagueResultsPage() {
  const seasons = useSeasons().data ?? [];
  const leagues = useList('/competitions', { type: 'league' }).data ?? [];
  const [url, setUrl] = useUrlState({ competition: '', season: '' });
  const season = seasons.find((s) => (url.season ? s.slug === url.season : s.isCurrent));
  return (
    <ResourceScreen
      title="Other league results"
      subtitle="Games between other schools in Turi's leagues. They count in the public league tables straight away."
      noun="result"
      nameOf={resultText}
      filters={
        <>
          <Select label="League" options={[{ value: '', label: 'All leagues' }, ...optionsOf(leagues, leagueLabel)]} value={url.competition} onChange={(e) => setUrl({ competition: e.target.value })} />
          <Select label="Season" options={seasons.map((s) => ({ value: s.slug, label: s.label }))} value={season?.slug ?? ''} onChange={(e) => setUrl({ season: seasons.find((s) => s.slug === e.target.value)?.isCurrent ? '' : e.target.value })} />
        </>
      }
      query={useList('/league-results', { competition: url.competition || undefined, season: url.season || undefined })}
      resource={useResource('/league-results')}
      columns={columns}
      Form={LeagueResultForm}
      formProps={{ competitionId: url.competition || undefined, seasonId: season?.id }}
    />
  );
}
