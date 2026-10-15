import { Badge } from '../../../components/Badge/Badge.jsx';
import { ResourceForm } from '../../../components/ResourceForm/ResourceForm.jsx';
import { ResourceScreen } from '../../../components/ResourceScreen/ResourceScreen.jsx';
import { Select } from '../../../components/Select/Select.jsx';
import { SportFilter } from '../../../components/SportFilter/SportFilter.jsx';
import { TextInput } from '../../../components/TextInput/TextInput.jsx';
import { useList, useResource } from '../../../hooks/resources.js';
import { useSports } from '../../../hooks/sports.js';
import { useUrlState } from '../../../hooks/useUrlState.js';
import { optionsOf } from '../../../lib/options.js';

const COMPETITION_TYPES = [
  { value: 'league', label: 'League' },
  { value: 'cup', label: 'Cup' },
  { value: 'friendly', label: 'Friendly' },
];
const TYPE_TONES = { league: 'navy', cup: 'gold', friendly: 'neutral' };

const columns = [
  { key: 'name', header: 'Competition', isRowHeader: true },
  { key: 'shortName', header: 'Short name' },
  { key: 'sport', header: 'Sport', render: (c) => c.sport.name },
  { key: 'type', header: 'Type', render: (c) => <Badge tone={TYPE_TONES[c.type]}>{c.type}</Badge> },
];

function CompetitionForm({ item, sportId, ...props }) {
  const sports = useSports();
  return (
    <ResourceForm
      item={item}
      {...props}
      defaultValues={{ sport: sportId ?? '', name: item?.name ?? '', shortName: item?.shortName ?? '', type: item?.type ?? 'league' }}
      toBody={({ sport, ...values }) => (item ? values : { sport, ...values })}
    >
      {({ register, formState: { errors } }) => (
        <>
          {!item && <Select label="Sport" placeholder="Choose a sport" options={optionsOf(sports.data)} error={errors.sport?.message} {...register('sport', { required: 'Choose a sport' })} />}
          <TextInput label="Name" placeholder="KISL Premier Division" error={errors.name?.message} {...register('name', { required: 'Enter the name' })} />
          <TextInput label="Short name" hint="Shown in tables and on fixtures" error={errors.shortName?.message} {...register('shortName', { required: 'Enter a short name' })} />
          <Select label="Type" hint="Only leagues have a league table" options={COMPETITION_TYPES} error={errors.type?.message} {...register('type')} />
        </>
      )}
    </ResourceForm>
  );
}

/** D7 Competitions. */
export function CompetitionsPage() {
  const [url, setUrl] = useUrlState({ sport: '' });
  const sports = useSports();
  return (
    <ResourceScreen
      title="Competitions"
      subtitle="Leagues, cups and friendlies that fixtures are played in."
      noun="competition"
      nameOf={(c) => c.name}
      filters={<SportFilter value={url.sport} onChange={(sport) => setUrl({ sport })} />}
      query={useList('/competitions', { sport: url.sport })}
      resource={useResource('/competitions')}
      columns={columns}
      Form={CompetitionForm}
      formProps={{ sportId: sports.data?.find((s) => s.slug === url.sport)?.id }}
    />
  );
}
